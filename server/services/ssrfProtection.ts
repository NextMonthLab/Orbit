import { lookup } from 'dns';
import { promisify } from 'util';

const dnsLookup = promisify(lookup);

// RFC1918 private IP ranges + localhost + link-local + metadata IPs
const BLOCKED_IP_PATTERNS = [
  /^127\.\d+\.\d+\.\d+$/,           // localhost
  /^10\.\d+\.\d+\.\d+$/,            // 10.0.0.0/8
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/, // 172.16.0.0/12
  /^192\.168\.\d+\.\d+$/,           // 192.168.0.0/16
  /^169\.254\.\d+\.\d+$/,           // link-local
  /^0\.0\.0\.0$/,                   // null address
  /^::1$/,                          // IPv6 localhost
  /^fc00:/i,                        // IPv6 private
  /^fe80:/i,                        // IPv6 link-local
];

// Cloud metadata IPs (AWS, GCP, Azure)
const METADATA_IPS = [
  '169.254.169.254',  // AWS/GCP/Azure
  '100.100.100.200',  // Alibaba Cloud
  'fd00:ec2::254',    // AWS IPv6
];

// Blocked domains
const BLOCKED_DOMAINS = [
  'localhost',
  'internal',
  'local',
  '.local',
  '.internal',
  '.localhost',
  'metadata.google.internal',
];

export interface SSRFValidationResult {
  safe: boolean;
  resolvedIp?: string;
  error?: string;
}

function isBlockedIp(ip: string): boolean {
  if (METADATA_IPS.includes(ip)) {
    return true;
  }
  return BLOCKED_IP_PATTERNS.some(pattern => pattern.test(ip));
}

function isBlockedDomain(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  return BLOCKED_DOMAINS.some(blocked => 
    lower === blocked || lower.endsWith(blocked)
  );
}

export async function validateUrlForSSRF(urlString: string): Promise<SSRFValidationResult> {
  try {
    const url = new URL(urlString);
    
    // HTTPS enforcement (v1 requirement)
    if (url.protocol !== 'https:') {
      return { 
        safe: false, 
        error: 'Only HTTPS URLs are allowed for security' 
      };
    }
    
    const hostname = url.hostname;
    
    // Check for blocked domains
    if (isBlockedDomain(hostname)) {
      return { 
        safe: false, 
        error: 'This hostname is not allowed' 
      };
    }
    
    // Check if hostname is an IP address directly
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipRegex.test(hostname)) {
      if (isBlockedIp(hostname)) {
        return { 
          safe: false, 
          error: 'Private IP addresses are not allowed' 
        };
      }
      return { safe: true, resolvedIp: hostname };
    }
    
    // DNS resolution to check actual IP
    try {
      const result = await dnsLookup(hostname);
      const resolvedIp = result.address;
      
      if (isBlockedIp(resolvedIp)) {
        return { 
          safe: false, 
          error: 'The resolved IP address is not allowed' 
        };
      }
      
      return { safe: true, resolvedIp };
    } catch (dnsError) {
      return { 
        safe: false, 
        error: 'Unable to resolve hostname' 
      };
    }
  } catch (parseError) {
    return { 
      safe: false, 
      error: 'Invalid URL format' 
    };
  }
}

export function sanitizeUrl(urlString: string): string | null {
  try {
    const url = new URL(urlString);
    // Remove credentials from URL
    url.username = '';
    url.password = '';
    return url.toString();
  } catch {
    return null;
  }
}
