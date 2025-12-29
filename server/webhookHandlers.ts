import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { storage } from './storage';
import type { Plan, PlanFeatures } from '@shared/schema';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    
    // First, sync to stripe schema
    await sync.processWebhook(payload, signature);
    
    // Then, handle events that affect our local subscriptions/entitlements
    try {
      const event = JSON.parse(payload.toString());
      await WebhookHandlers.handleEvent(event);
    } catch (error) {
      console.error('[webhook] Error handling event:', error);
      // Don't throw - the sync already succeeded
    }
  }
  
  static async handleEvent(event: any): Promise<void> {
    const eventType = event.type;
    const data = event.data?.object;
    
    if (!data) return;
    
    switch (eventType) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await WebhookHandlers.handleSubscriptionUpdate(data);
        break;
        
      case 'customer.subscription.deleted':
        await WebhookHandlers.handleSubscriptionCancellation(data);
        break;
        
      case 'checkout.session.completed':
        // Checkout completion is handled by /api/checkout/verify
        console.log(`[webhook] Checkout session completed: ${data.id}`);
        break;
        
      case 'invoice.payment_succeeded':
        // Could handle invoice payment for renewal
        console.log(`[webhook] Invoice payment succeeded: ${data.id}`);
        break;
        
      case 'invoice.payment_failed':
        await WebhookHandlers.handlePaymentFailed(data);
        break;
        
      default:
        // Ignore other events
        break;
    }
  }
  
  static async handleSubscriptionUpdate(stripeSubscription: any): Promise<void> {
    const stripeSubscriptionId = stripeSubscription.id;
    const stripeCustomerId = stripeSubscription.customer;
    const status = stripeSubscription.status;
    const priceId = stripeSubscription.items?.data?.[0]?.price?.id;
    
    if (!priceId) {
      console.log(`[webhook] No price ID found for subscription ${stripeSubscriptionId}`);
      return;
    }
    
    const currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
    const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
    
    await WebhookHandlers.handleSubscriptionChange(
      stripeCustomerId,
      stripeSubscriptionId,
      status,
      currentPeriodStart,
      currentPeriodEnd,
      priceId
    );
  }
  
  static async handleSubscriptionCancellation(stripeSubscription: any): Promise<void> {
    const stripeSubscriptionId = stripeSubscription.id;
    const subscription = await storage.getSubscriptionByStripeId(stripeSubscriptionId);
    
    if (!subscription) {
      console.log(`[webhook] No subscription found for canceled Stripe ID: ${stripeSubscriptionId}`);
      return;
    }
    
    await storage.updateSubscription(subscription.id, {
      status: 'canceled',
    });
    
    // Downgrade to free tier entitlements
    const freePlan = await storage.getPlanByName('free');
    if (freePlan) {
      await WebhookHandlers.recomputeEntitlements(subscription.userId, freePlan);
    }
    
    // Auto-pause all ICEs
    await WebhookHandlers.autoPauseExcessIces(subscription.userId, 0);
    
    console.log(`[webhook] Subscription ${subscription.id} canceled for user ${subscription.userId}`);
  }
  
  static async handlePaymentFailed(invoice: any): Promise<void> {
    const stripeSubscriptionId = invoice.subscription;
    if (!stripeSubscriptionId) return;
    
    const subscription = await storage.getSubscriptionByStripeId(stripeSubscriptionId);
    if (!subscription) return;
    
    await storage.updateSubscription(subscription.id, {
      status: 'past_due',
    });
    
    console.log(`[webhook] Payment failed for subscription ${subscription.id}, user ${subscription.userId}`);
  }

  static async handleSubscriptionChange(
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    status: string,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    priceId: string
  ): Promise<void> {
    const subscription = await storage.getSubscriptionByStripeId(stripeSubscriptionId);
    if (!subscription) {
      console.log(`[webhook] No subscription found for Stripe ID: ${stripeSubscriptionId}`);
      return;
    }

    const plan = await storage.getPlanByStripePriceId(priceId);
    if (!plan) {
      console.log(`[webhook] No plan found for price ID: ${priceId}`);
      return;
    }

    const oldPlanId = subscription.planId;
    const lastCreditGrant = subscription.lastCreditGrantPeriodEnd;

    await storage.updateSubscription(subscription.id, {
      status: status as any,
      planId: plan.id,
      currentPeriodStart,
      currentPeriodEnd,
    });

    await WebhookHandlers.recomputeEntitlements(subscription.userId, plan);

    // Grant monthly credits with idempotency check using lastCreditGrantPeriodEnd
    // Only grant if: status is active AND this period hasn't been credited yet
    if (status === 'active' && plan.features) {
      const features = plan.features as PlanFeatures;
      const hasCredits = (features.monthlyVideoCredits || 0) > 0 || (features.monthlyVoiceCredits || 0) > 0;
      
      // Check if this billing period has already received credits
      const alreadyGranted = lastCreditGrant && 
        currentPeriodEnd.getTime() <= lastCreditGrant.getTime();
      
      if (hasCredits && !alreadyGranted) {
        await storage.grantMonthlyCredits(
          subscription.userId,
          features.monthlyVideoCredits || 0,
          features.monthlyVoiceCredits || 0
        );
        // Update the lastCreditGrantPeriodEnd to prevent duplicate grants
        await storage.updateSubscription(subscription.id, {
          lastCreditGrantPeriodEnd: currentPeriodEnd,
        });
        console.log(`[webhook] Granted monthly credits for user ${subscription.userId} (period: ${currentPeriodEnd.toISOString()})`);
      }
    }

    // Handle auto-pause on downgrade or cancellation
    if (status === 'canceled' || status === 'unpaid' || status === 'past_due') {
      await WebhookHandlers.autoPauseExcessIces(subscription.userId, 0);
    } else if (oldPlanId !== plan.id) {
      // Plan changed - check if downgrade
      const newLimit = WebhookHandlers.getActiveIceLimit(plan.name);
      await WebhookHandlers.autoPauseExcessIces(subscription.userId, newLimit);
    }
  }

  static getActiveIceLimit(planName: string): number {
    const normalizedName = planName.toLowerCase();
    if (normalizedName.includes('business') || normalizedName.includes('intelligence')) return 10;
    if (normalizedName.includes('pro') || normalizedName.includes('grow') || normalizedName.includes('understand')) return 3;
    return 0; // Free tier
  }

  static async autoPauseExcessIces(userId: number, limit: number): Promise<void> {
    if (limit === -1) return; // Unlimited
    
    try {
      const icesToPause = await storage.getIcesToPauseOnDowngrade(userId, limit);
      for (const ice of icesToPause) {
        await storage.pauseIce(ice.id);
        console.log(`Auto-paused ICE ${ice.id} (${ice.name}) for user ${userId} due to plan limit`);
      }
      if (icesToPause.length > 0) {
        console.log(`Auto-paused ${icesToPause.length} ICEs for user ${userId} (new limit: ${limit})`);
      }
    } catch (error) {
      console.error(`Error auto-pausing ICEs for user ${userId}:`, error);
    }
  }

  static async recomputeEntitlements(userId: number, plan: Plan): Promise<void> {
    const features = (plan.features as PlanFeatures) || {};
    
    await storage.upsertEntitlements(userId, {
      canUseCloudLlm: features.canUseCloudLlm || false,
      canGenerateImages: features.canGenerateImages || false,
      canExport: features.canExport || false,
      canUseCharacterChat: features.canUseCharacterChat || false,
      maxCardsPerStory: features.maxCardsPerStory || 5,
      storageDays: features.storageDays || 7,
      collaborationRoles: features.collaborationRoles || false,
    });
  }
}
