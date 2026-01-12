export interface LineComposition {
  lines: string[];
  score: number;
}

function scoreLayout(lines: string[]): number {
  let score = 0;
  
  const ORPHAN_PENALTY = 1000;
  for (const line of lines) {
    const wordCount = line.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount === 1) {
      score += ORPHAN_PENALTY;
    }
  }
  
  const lengths = lines.map(l => l.length);
  const maxLen = Math.max(...lengths);
  const minLen = Math.min(...lengths);
  
  const imbalancePenalty = maxLen - minLen;
  score += imbalancePenalty * 2;
  
  const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLen, 2), 0) / lengths.length;
  score += Math.sqrt(variance);
  
  score += lines.length * 0.5;
  
  return score;
}

function generateBreakpoints(words: string[], maxLines: number): string[][] {
  const results: string[][] = [];
  
  if (maxLines === 1 || words.length <= 1) {
    results.push([words.join(' ')]);
    return results;
  }
  
  if (maxLines === 2) {
    for (let i = 1; i < words.length; i++) {
      const line1 = words.slice(0, i).join(' ');
      const line2 = words.slice(i).join(' ');
      results.push([line1, line2]);
    }
  } else if (maxLines >= 3) {
    for (let i = 1; i < words.length - 1; i++) {
      for (let j = i + 1; j < words.length; j++) {
        const line1 = words.slice(0, i).join(' ');
        const line2 = words.slice(i, j).join(' ');
        const line3 = words.slice(j).join(' ');
        results.push([line1, line2, line3]);
      }
    }
    
    for (let i = 1; i < words.length; i++) {
      const line1 = words.slice(0, i).join(' ');
      const line2 = words.slice(i).join(' ');
      results.push([line1, line2]);
    }
  }
  
  return results;
}

export function composeLines(text: string, maxLines: number): LineComposition {
  const trimmedText = text.trim();
  
  if (!trimmedText) {
    return { lines: [''], score: 0 };
  }
  
  const words = trimmedText.split(/\s+/).filter(w => w.length > 0);
  
  if (words.length === 1) {
    return { lines: [trimmedText], score: 0 };
  }
  
  if (maxLines === 1) {
    return { lines: [trimmedText], score: 0 };
  }
  
  const layouts = generateBreakpoints(words, maxLines);
  layouts.push([trimmedText]);
  
  let bestLayout: string[] = [trimmedText];
  let bestScore = Infinity;
  
  for (const layout of layouts) {
    const score = scoreLayout(layout);
    if (score < bestScore) {
      bestScore = score;
      bestLayout = layout;
    }
  }
  
  return {
    lines: bestLayout,
    score: bestScore
  };
}

export function getAllCompositions(text: string, maxLines: number): LineComposition[] {
  const trimmedText = text.trim();
  
  if (!trimmedText) {
    return [{ lines: [''], score: 0 }];
  }
  
  const words = trimmedText.split(/\s+/).filter(w => w.length > 0);
  
  if (words.length === 1) {
    return [{ lines: [trimmedText], score: 0 }];
  }
  
  if (maxLines === 1) {
    return [{ lines: [trimmedText], score: 0 }];
  }
  
  const layouts = generateBreakpoints(words, maxLines);
  layouts.push([trimmedText]);
  
  return layouts.map(lines => ({
    lines,
    score: scoreLayout(lines)
  })).sort((a, b) => a.score - b.score);
}
