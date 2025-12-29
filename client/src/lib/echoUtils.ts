export function dedupeText(text: string): string {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  const seen = new Set<string>();
  const deduped: string[] = [];
  
  for (const line of lines) {
    const normalized = line.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');
    if (normalized.length < 3) {
      deduped.push(line);
      continue;
    }
    
    let isDupe = false;
    for (const existing of seen) {
      if (similarity(normalized, existing) > 0.85) {
        isDupe = true;
        break;
      }
    }
    
    if (!isDupe) {
      seen.add(normalized);
      deduped.push(line);
    }
  }
  
  return deduped.join('\n');
}

function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;
  
  const wordsA = new Set(a.split(' '));
  const wordsB = new Set(b.split(' '));
  const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
  const union = new Set([...wordsA, ...wordsB]);
  
  return intersection.size / union.size;
}

export function echoStyleGuard(text: string): string {
  let result = text;
  
  result = result.replace(/\b([A-Z]{2,}(?:\s+[A-Z]{2,})*)\b/g, (match) => {
    const acronyms = ['API', 'UK', 'USA', 'CEO', 'CTO', 'FAQ', 'PDF', 'URL', 'TLS', 'SSL', 'VAT', 'ROI', 'B2B', 'B2C'];
    if (acronyms.includes(match)) return match;
    
    if (match.length <= 4) return match;
    
    return match.split(' ')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  });
  
  const roboticPhrases = [
    /What would you like to explore about\s*["']?[^"'?]*["']?\??/gi,
    /What would you like to know about\s*["']?[^"'?]*["']?\??/gi,
    /Would you like to learn more about\s*["']?[^"'?]*["']?\??/gi,
    /Is there anything else you'd like to know\??/gi,
    /Let me know if you have any questions\.?/gi,
    /Feel free to ask if you have any questions\.?/gi,
    /I'm here to help with any questions\.?/gi,
    /I'd be happy to help\.?/gi,
    /Great question!/gi,
    /That's a great question!/gi,
  ];
  
  for (const pattern of roboticPhrases) {
    result = result.replace(pattern, '').trim();
  }
  
  result = result.replace(/\n{3,}/g, '\n\n');
  result = result.replace(/^\s+|\s+$/g, '');
  
  return result;
}

export function formatEchoResponse(
  title: string,
  summary: string,
  options?: {
    bullets?: string[];
    link?: { label: string; url: string };
    chips?: string[];
  }
): string {
  const parts: string[] = [];
  
  const cleanTitle = echoStyleGuard(title);
  if (cleanTitle && cleanTitle !== summary.slice(0, cleanTitle.length)) {
    parts.push(cleanTitle);
  }
  
  if (summary) {
    parts.push(summary);
  }
  
  if (options?.bullets && options.bullets.length > 0) {
    const bulletList = options.bullets.slice(0, 4).map(b => `• ${b}`).join('\n');
    parts.push(bulletList);
  }
  
  if (options?.link) {
    parts.push(`${options.link.label}: ${options.link.url}`);
  }
  
  return dedupeText(parts.join('\n\n'));
}
