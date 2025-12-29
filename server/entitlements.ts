import { storage } from './storage';
import type { Request, Response, NextFunction } from 'express';
import type { User, UserRole, OrbitTier } from '@shared/schema';

export type EntitlementKey = 
  | 'canUseCloudLlm'
  | 'canGenerateImages'
  | 'canExport'
  | 'canUseCharacterChat'
  | 'collaborationRoles'
  | 'canCreateStory'
  | 'canCreateCharacter'
  | 'canUploadAudio'
  | 'canViewAnalytics'
  | 'canViewEngagement';

export interface FullEntitlements {
  canCreateStory: boolean;
  canCreateCharacter: boolean;
  canUploadAudio: boolean;
  canGenerateImages: boolean;
  canGenerateVideos: boolean;
  canExport: boolean;
  canUseCharacterChat: boolean;
  canUseCloudLlm: boolean;
  canViewAnalytics: boolean;
  canViewEngagement: boolean;
  maxUniverses: number;
  maxCardsPerStory: number;
  monthlyVideoCredits: number;
  monthlyVoiceCredits: number;
  planName: string;
  isAdmin: boolean;
  isCreator: boolean;
}

function detectTierFromSlug(slug: string | null | undefined): string {
  if (!slug) return 'free';
  const normalizedSlug = slug.toLowerCase();
  
  if (normalizedSlug.includes('business') || normalizedSlug.includes('enterprise')) {
    return 'business';
  }
  if (normalizedSlug.includes('pro') || normalizedSlug.includes('premium')) {
    return 'pro';
  }
  return 'free';
}

const TIER_DEFAULTS: Record<string, Partial<FullEntitlements>> = {
  free: {
    canCreateStory: true,
    canCreateCharacter: false,
    canUploadAudio: false,
    canGenerateImages: false,
    canGenerateVideos: false,
    canExport: false,
    canUseCharacterChat: false,
    canUseCloudLlm: false,
    canViewAnalytics: false,
    canViewEngagement: false, // Engagement metrics require Pro or Business
    maxUniverses: 1,
    maxCardsPerStory: 5,
    monthlyVideoCredits: 0,
    monthlyVoiceCredits: 0,
  },
  pro: {
    canCreateStory: true,
    canCreateCharacter: true,
    canUploadAudio: true,
    canGenerateImages: true,
    canGenerateVideos: false,
    canExport: true,
    canUseCharacterChat: true,
    canUseCloudLlm: true,
    canViewAnalytics: true,
    canViewEngagement: true,
    maxUniverses: -1,
    maxCardsPerStory: 50,
    monthlyVideoCredits: 0,
    monthlyVoiceCredits: 100,
  },
  business: {
    canCreateStory: true,
    canCreateCharacter: true,
    canUploadAudio: true,
    canGenerateImages: true,
    canGenerateVideos: true,
    canExport: true,
    canUseCharacterChat: true,
    canUseCloudLlm: true,
    canViewAnalytics: true,
    canViewEngagement: true,
    maxUniverses: -1,
    maxCardsPerStory: -1,
    monthlyVideoCredits: 50,
    monthlyVoiceCredits: 500,
  },
};

export async function getFullEntitlements(userId: number): Promise<FullEntitlements> {
  const user = await storage.getUser(userId);
  if (!user) {
    return getDefaultEntitlements();
  }
  
  if (user.role === 'admin' || user.isAdmin) {
    return getAdminEntitlements();
  }
  
  if (user.role === 'creator') {
    const creatorProfile = await storage.getCreatorProfile(userId);
    if (creatorProfile && creatorProfile.planId && creatorProfile.subscriptionStatus === 'active') {
      const plan = await storage.getPlan(creatorProfile.planId);
      if (plan) {
        const tierSlug = detectTierFromSlug(plan.slug);
        const tierDefaults = TIER_DEFAULTS[tierSlug] || TIER_DEFAULTS.free;
        const features = (plan.features as Record<string, any>) || {};
        
        return {
          canCreateStory: true,
          canCreateCharacter: features.canCreateCharacter ?? tierDefaults.canCreateCharacter ?? false,
          canUploadAudio: features.canUploadAudio ?? tierDefaults.canUploadAudio ?? false,
          canGenerateImages: features.canGenerateImages ?? tierDefaults.canGenerateImages ?? false,
          canGenerateVideos: features.canGenerateVideos ?? tierDefaults.canGenerateVideos ?? false,
          canExport: features.canExport ?? tierDefaults.canExport ?? false,
          canUseCharacterChat: features.canUseCharacterChat ?? tierDefaults.canUseCharacterChat ?? false,
          canUseCloudLlm: features.canUseCloudLlm ?? tierDefaults.canUseCloudLlm ?? false,
          canViewAnalytics: features.canViewAnalytics ?? tierDefaults.canViewAnalytics ?? false,
          canViewEngagement: features.canViewEngagement ?? tierDefaults.canViewEngagement ?? false,
          maxUniverses: features.maxUniverses ?? tierDefaults.maxUniverses ?? 1,
          maxCardsPerStory: features.maxCardsPerStory ?? tierDefaults.maxCardsPerStory ?? 5,
          monthlyVideoCredits: features.monthlyVideoCredits ?? tierDefaults.monthlyVideoCredits ?? 0,
          monthlyVoiceCredits: features.monthlyVoiceCredits ?? tierDefaults.monthlyVoiceCredits ?? 0,
          planName: plan.displayName,
          isAdmin: false,
          isCreator: true,
        };
      }
    }
    return getCreatorFreeEntitlements();
  }
  
  return getDefaultEntitlements();
}

function getAdminEntitlements(): FullEntitlements {
  return {
    canCreateStory: true,
    canCreateCharacter: true,
    canUploadAudio: true,
    canGenerateImages: true,
    canGenerateVideos: true,
    canExport: true,
    canUseCharacterChat: true,
    canUseCloudLlm: true,
    canViewAnalytics: true,
    canViewEngagement: true,
    maxUniverses: -1,
    maxCardsPerStory: -1,
    monthlyVideoCredits: -1,
    monthlyVoiceCredits: -1,
    planName: 'Admin',
    isAdmin: true,
    isCreator: true,
  };
}

function getCreatorFreeEntitlements(): FullEntitlements {
  return {
    canCreateStory: true,
    canCreateCharacter: false,
    canUploadAudio: false,
    canGenerateImages: false,
    canGenerateVideos: false,
    canExport: false,
    canUseCharacterChat: false,
    canUseCloudLlm: false,
    canViewAnalytics: false,
    canViewEngagement: false, // Engagement metrics require Pro or Business
    maxUniverses: 1,
    maxCardsPerStory: 5,
    monthlyVideoCredits: 0,
    monthlyVoiceCredits: 0,
    planName: 'Free',
    isAdmin: false,
    isCreator: true,
  };
}

function getDefaultEntitlements(): FullEntitlements {
  return {
    canCreateStory: false,
    canCreateCharacter: false,
    canUploadAudio: false,
    canGenerateImages: false,
    canGenerateVideos: false,
    canExport: false,
    canUseCharacterChat: false,
    canUseCloudLlm: false,
    canViewAnalytics: false,
    canViewEngagement: false,
    maxUniverses: 0,
    maxCardsPerStory: 0,
    monthlyVideoCredits: 0,
    monthlyVoiceCredits: 0,
    planName: 'Viewer',
    isAdmin: false,
    isCreator: false,
  };
}

export async function requireEntitlement(
  userId: number,
  key: EntitlementKey
): Promise<{ allowed: boolean; reason?: string }> {
  const entitlements = await getFullEntitlements(userId);
  
  const keyMap: Record<EntitlementKey, keyof FullEntitlements> = {
    canUseCloudLlm: 'canUseCloudLlm',
    canGenerateImages: 'canGenerateImages',
    canExport: 'canExport',
    canUseCharacterChat: 'canUseCharacterChat',
    collaborationRoles: 'isCreator',
    canCreateStory: 'canCreateStory',
    canCreateCharacter: 'canCreateCharacter',
    canUploadAudio: 'canUploadAudio',
    canViewAnalytics: 'canViewAnalytics',
    canViewEngagement: 'canViewEngagement',
  };
  
  const entitlementKey = keyMap[key];
  const allowed = entitlements[entitlementKey] === true;
  
  if (!allowed) {
    return { 
      allowed: false, 
      reason: `This feature requires a Pro or Business plan. Please upgrade to access.` 
    };
  }

  return { allowed: true };
}

export async function checkMaxCards(userId: number, currentCardCount: number): Promise<{ allowed: boolean; limit: number }> {
  const entitlements = await getFullEntitlements(userId);
  const limit = entitlements.maxCardsPerStory === -1 ? Infinity : entitlements.maxCardsPerStory;
  
  return {
    allowed: currentCardCount < limit,
    limit: entitlements.maxCardsPerStory
  };
}

export async function checkCredits(
  userId: number,
  creditType: 'video' | 'voice',
  amount: number = 1
): Promise<{ allowed: boolean; balance: number }> {
  const wallet = await storage.getCreditWallet(userId);
  const balance = creditType === 'video' ? wallet?.videoCredits || 0 : wallet?.voiceCredits || 0;
  
  return {
    allowed: balance >= amount,
    balance
  };
}

export function entitlementMiddleware(key: EntitlementKey) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const result = await requireEntitlement((req.user as any).id, key);
    
    if (!result.allowed) {
      return res.status(403).json({ 
        message: result.reason,
        upgradeRequired: true,
        feature: key
      });
    }

    next();
  };
}

export function creditMiddleware(creditType: 'video' | 'voice', amount: number = 1) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const result = await checkCredits((req.user as any).id, creditType, amount);
    
    if (!result.allowed) {
      return res.status(403).json({ 
        message: `Insufficient ${creditType} credits. You have ${result.balance}, need ${amount}.`,
        creditsRequired: true,
        creditType,
        balance: result.balance,
        needed: amount
      });
    }

    next();
  };
}

export function requireCreatorOrAdmin() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const user = req.user as User;
    if (user.role === 'admin' || user.isAdmin || user.role === 'creator') {
      return next();
    }
    
    return res.status(403).json({ 
      message: 'Creator or Admin access required. Become a creator to access this feature.',
      becomeCreator: true
    });
  };
}

export function requireRole(...allowedRoles: UserRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const user = req.user as User;
    if (user.isAdmin || allowedRoles.includes(user.role as UserRole)) {
      return next();
    }
    
    return res.status(403).json({ 
      message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
    });
  };
}

// ============ ORBIT ENTITLEMENTS ============
// Orbit-specific tier entitlements for the Business Hub

export interface OrbitEntitlements {
  tier: OrbitTier;
  tierDisplayName: string;
  priceMonthly: number;
  
  // Free tier - everyone
  canViewGrid: boolean;
  canViewPublicICE: boolean;
  canViewBasicAnalytics: boolean;
  canManageBoxes: boolean;
  
  // Grow tier (£19.99/mo)
  canViewSignalAccessMetrics: boolean;
  canViewVisitorPatterns: boolean;
  canCustomizeBranding: boolean;
  monthlyICECredits: number;
  
  // Insight tier (£49.99/mo)
  canViewConversationTranscripts: boolean;
  canViewPatternIntelligence: boolean;
  canExportAnalytics: boolean;
  canViewLeadEnrichment: boolean;
  
  // Intelligence tier (£99.99/mo)
  canUseAIAdvisor: boolean;
  canAutoGenerateICE: boolean;
  unlimitedICE: boolean;
  prioritySupport: boolean;
}

const ORBIT_TIER_PRICING: Record<OrbitTier, number> = {
  free: 0,
  grow: 19.99,
  insight: 49.99,
  intelligence: 99.99,
};

const ORBIT_TIER_DISPLAY_NAMES: Record<OrbitTier, string> = {
  free: 'Free',
  grow: 'Grow',
  insight: 'Insight',
  intelligence: 'Intelligence',
};

const ORBIT_TIER_ICE_CREDITS: Record<OrbitTier, number> = {
  free: 0,
  grow: 3,
  insight: 10,
  intelligence: -1, // Unlimited
};

export function getOrbitEntitlements(tier: OrbitTier): OrbitEntitlements {
  const tierLevel = ['free', 'grow', 'insight', 'intelligence'].indexOf(tier);
  
  return {
    tier,
    tierDisplayName: ORBIT_TIER_DISPLAY_NAMES[tier],
    priceMonthly: ORBIT_TIER_PRICING[tier],
    
    // Free tier - everyone
    canViewGrid: true,
    canViewPublicICE: true,
    canViewBasicAnalytics: true,
    canManageBoxes: true,
    
    // Grow tier (£19.99/mo) - requires tier >= 1
    canViewSignalAccessMetrics: tierLevel >= 1,
    canViewVisitorPatterns: tierLevel >= 1,
    canCustomizeBranding: tierLevel >= 1,
    monthlyICECredits: ORBIT_TIER_ICE_CREDITS[tier],
    
    // Insight tier (£49.99/mo) - requires tier >= 2
    canViewConversationTranscripts: tierLevel >= 2,
    canViewPatternIntelligence: tierLevel >= 2,
    canExportAnalytics: tierLevel >= 2,
    canViewLeadEnrichment: tierLevel >= 2,
    
    // Intelligence tier (£99.99/mo) - requires tier >= 3
    canUseAIAdvisor: tierLevel >= 3,
    canAutoGenerateICE: tierLevel >= 3,
    unlimitedICE: tierLevel >= 3,
    prioritySupport: tierLevel >= 3,
  };
}

export async function getOrbitEntitlementsBySlug(orbitSlug: string): Promise<OrbitEntitlements | null> {
  const orbitMeta = await storage.getOrbitMeta(orbitSlug);
  if (!orbitMeta) return null;
  
  return getOrbitEntitlements(orbitMeta.planTier as OrbitTier);
}
