export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

const baseStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; margin: 0; padding: 0; background-color: #0f0f23; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .card { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.1); }
  .logo { margin-bottom: 24px; }
  .logo img { height: 32px; width: auto; }
  h1 { color: #ffffff; font-size: 28px; margin: 0 0 16px 0; font-weight: 600; }
  p { color: #a1a1aa; font-size: 16px; margin: 0 0 16px 0; }
  .button { display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 24px 0; }
  .button:hover { opacity: 0.9; }
  .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1); }
  .footer p { font-size: 13px; color: #71717a; }
  .warning { background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 8px; padding: 12px 16px; margin: 16px 0; }
  .warning p { color: #fbbf24; font-size: 14px; margin: 0; }
`;

const LOGO_URL = 'https://businessorbit.io/logo.png';

function wrapHtml(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <img src="${LOGO_URL}" alt="Orbit" style="height: 32px; width: auto;" />
      </div>
      ${content}
      <div class="footer">
        <p>This email was sent by Orbit. If you didn't expect this email, you can safely ignore it.</p>
        <p>&copy; ${new Date().getFullYear()} Orbit. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function orbitClaimMagicLink(params: {
  businessName: string;
  claimUrl: string;
  expiryMinutes: number;
  isFreeEmailDomain: boolean;
}): EmailTemplate {
  const { businessName, claimUrl, expiryMinutes, isFreeEmailDomain } = params;
  
  const warningBlock = isFreeEmailDomain ? `
    <div class="warning">
      <p>You're using a personal email address. For organisations, we recommend using your work email to verify ownership.</p>
    </div>
  ` : '';
  
  const html = wrapHtml(`
    <h1>Claim Your Orbit</h1>
    <p>Someone requested to claim the Orbit for <strong>${businessName}</strong>. If this was you, click the button below to verify your email and claim ownership.</p>
    ${warningBlock}
    <a href="${claimUrl}" class="button">Claim Your Orbit</a>
    <p>This link will expire in ${expiryMinutes} minutes.</p>
    <p style="font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
  `);

  const text = `Claim Your Orbit

Someone requested to claim the Orbit for ${businessName}. If this was you, click the link below to verify your email and claim ownership.

${isFreeEmailDomain ? 'Note: You\'re using a personal email. For organisations, we recommend using your work email.\n' : ''}
Claim your Orbit: ${claimUrl}

This link will expire in ${expiryMinutes} minutes.

If you didn't request this, you can safely ignore this email.

---
Orbit`;

  return {
    subject: `Claim your Orbit for ${businessName}`,
    html,
    text,
  };
}

export function orbitClaimConfirmed(params: {
  businessName: string;
  orbitUrl: string;
}): EmailTemplate {
  const { businessName, orbitUrl } = params;
  
  const html = wrapHtml(`
    <h1>Your Orbit is Live!</h1>
    <p>Congratulations! You've successfully claimed the Orbit for <strong>${businessName}</strong>.</p>
    <p>Your AI-powered business presence is now active and ready to engage with visitors.</p>
    <a href="${orbitUrl}" class="button">View Your Orbit</a>
    <p>What's next:</p>
    <ul style="color: #a1a1aa; padding-left: 20px;">
      <li>Customize your Orbit's appearance and messaging</li>
      <li>Add your brand assets and story</li>
      <li>Monitor conversations and leads</li>
    </ul>
  `);

  const text = `Your Orbit is Live!

Congratulations! You've successfully claimed the Orbit for ${businessName}.

Your AI-powered business presence is now active and ready to engage with visitors.

View your Orbit: ${orbitUrl}

What's next:
- Customize your Orbit's appearance and messaging
- Add your brand assets and story
- Monitor conversations and leads

---
Orbit`;

  return {
    subject: `Your Orbit for ${businessName} is live!`,
    html,
    text,
  };
}

export function subscriptionChanged(params: {
  userName: string;
  planName: string;
  changeType: 'upgraded' | 'downgraded' | 'cancelled' | 'renewed';
  settingsUrl: string;
}): EmailTemplate {
  const { userName, planName, changeType, settingsUrl } = params;
  
  const titles: Record<string, string> = {
    upgraded: 'Subscription Upgraded',
    downgraded: 'Subscription Changed',
    cancelled: 'Subscription Cancelled',
    renewed: 'Subscription Renewed',
  };
  
  const messages: Record<string, string> = {
    upgraded: `Your subscription has been upgraded to <strong>${planName}</strong>. You now have access to all the features included in your new plan.`,
    downgraded: `Your subscription has been changed to <strong>${planName}</strong>. Your new plan limits will take effect at the start of your next billing cycle.`,
    cancelled: `Your subscription has been cancelled. You'll continue to have access to your current features until the end of your billing period.`,
    renewed: `Your <strong>${planName}</strong> subscription has been renewed. Thank you for your continued support!`,
  };

  const html = wrapHtml(`
    <h1>${titles[changeType]}</h1>
    <p>Hi ${userName},</p>
    <p>${messages[changeType]}</p>
    <a href="${settingsUrl}" class="button">Manage Subscription</a>
  `);

  const text = `${titles[changeType]}

Hi ${userName},

${messages[changeType].replace(/<\/?strong>/g, '')}

Manage your subscription: ${settingsUrl}

---
Orbit`;

  return {
    subject: titles[changeType],
    html,
    text,
  };
}

export function leadCapturedDigest(params: {
  userName: string;
  orbitName: string;
  leadCount: number;
  leadsUrl: string;
}): EmailTemplate {
  const { userName, orbitName, leadCount, leadsUrl } = params;
  
  const html = wrapHtml(`
    <h1>New Leads for ${orbitName}</h1>
    <p>Hi ${userName},</p>
    <p>You have <strong>${leadCount} new lead${leadCount > 1 ? 's' : ''}</strong> from your Orbit.</p>
    <a href="${leadsUrl}" class="button">View Leads</a>
  `);

  const text = `New Leads for ${orbitName}

Hi ${userName},

You have ${leadCount} new lead${leadCount > 1 ? 's' : ''} from your Orbit.

View leads: ${leadsUrl}

---
Orbit`;

  return {
    subject: `${leadCount} new lead${leadCount > 1 ? 's' : ''} from ${orbitName}`,
    html,
    text,
  };
}
