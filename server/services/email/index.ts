import { getEmailClient, isEmailConfigured } from './emailClient';
import type { EmailTemplate } from './templates';
export * from './templates';
export { isEmailConfigured };

interface SendEmailParams {
  to: string;
  template: EmailTemplate;
  replyTo?: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const { to, template, replyTo } = params;
  
  const emailDomain = to.split('@')[1] || 'unknown';
  
  try {
    if (!isEmailConfigured()) {
      console.warn('[email] Email not configured, skipping send to domain:', emailDomain);
      return { success: false, error: 'Email not configured' };
    }

    const { client, fromEmail } = await getEmailClient();
    
    console.log('[email] Sending email:', {
      to: `***@${emailDomain}`,
      subject: template.subject,
      from: fromEmail,
    });

    const result = await client.emails.send({
      from: fromEmail,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
      replyTo,
    });

    if (result.error) {
      console.error('[email] Send failed:', {
        domain: emailDomain,
        error: result.error.message,
      });
      return { success: false, error: result.error.message };
    }

    console.log('[email] Sent successfully:', {
      domain: emailDomain,
      messageId: result.data?.id,
    });

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[email] Send error:', {
      domain: emailDomain,
      error: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
}

const FREE_EMAIL_DOMAINS = [
  'gmail.com', 'googlemail.com',
  'yahoo.com', 'yahoo.co.uk', 'yahoo.fr', 'yahoo.de',
  'hotmail.com', 'outlook.com', 'live.com', 'msn.com',
  'icloud.com', 'me.com', 'mac.com',
  'aol.com',
  'protonmail.com', 'proton.me',
  'mail.com',
  'zoho.com',
  'yandex.com', 'yandex.ru',
  'gmx.com', 'gmx.de',
  'fastmail.com',
  'tutanota.com',
];

export function isFreeEmailDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? FREE_EMAIL_DOMAINS.includes(domain) : false;
}

export function getEmailDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase() || '';
}
