import crypto from 'crypto';

const SECRET = process.env.PUBLIC_TOKEN_SECRET || crypto.randomBytes(32).toString('hex');
const TOKEN_EXPIRY_SECONDS = 3600; // 1 hour
const TOKEN_VERSION = 1;

type ResourceType = 'story' | 'preview';
type Audience = 'analytics' | 'chat';

interface PublicAccessTokenPayload {
  ver: number;
  aud: Audience;
  resourceType: ResourceType;
  resourceId: string;
  iat: number;
  exp: number;
}

export function generatePublicAccessToken(
  resourceId: string | number, 
  resourceType: ResourceType,
  audience: Audience = resourceType === 'story' ? 'analytics' : 'chat'
): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: PublicAccessTokenPayload = {
    ver: TOKEN_VERSION,
    aud: audience,
    resourceType,
    resourceId: String(resourceId),
    iat: now,
    exp: now + TOKEN_EXPIRY_SECONDS,
  };
  
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(payloadBase64)
    .digest('base64url');
  
  return `${payloadBase64}.${signature}`;
}

export function verifyPublicAccessToken(token: string): PublicAccessTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) {
      return null;
    }
    
    const [payloadBase64, signature] = parts;
    
    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(payloadBase64)
      .digest('base64url');
    
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }
    
    const payload: PublicAccessTokenPayload = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString()
    );
    
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null;
    }
    
    // Backwards compatibility: accept tokens without ver/aud (version 0)
    if (payload.ver === undefined) {
      (payload as any).ver = 0;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}

export function validateStoryToken(token: string, expectedUniverseId: number): boolean {
  const payload = verifyPublicAccessToken(token);
  if (!payload) return false;
  return payload.resourceType === 'story' && payload.resourceId === String(expectedUniverseId);
}

export function validatePreviewToken(token: string, expectedPreviewId: string): boolean {
  const payload = verifyPublicAccessToken(token);
  if (!payload) return false;
  return payload.resourceType === 'preview' && payload.resourceId === expectedPreviewId;
}
