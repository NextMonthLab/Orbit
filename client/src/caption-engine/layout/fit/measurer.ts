let cachedCtx: CanvasRenderingContext2D | null = null;

export function getCanvasContext(): CanvasRenderingContext2D {
  if (cachedCtx) {
    return cachedCtx;
  }
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Cannot create canvas context');
  }
  cachedCtx = ctx;
  return ctx;
}

export function measureLineWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontSize: number,
  fontFamily: string = 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  fontWeight: number = 700
): number {
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  const metrics = ctx.measureText(text);
  return metrics.width;
}

export function checkLinesFit(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  availableWidth: number,
  fontSize: number,
  fontFamily?: string,
  fontWeight?: number
): { fits: boolean; maxWidth: number } {
  let maxWidth = 0;
  
  for (const line of lines) {
    const width = measureLineWidth(ctx, line, fontSize, fontFamily, fontWeight);
    maxWidth = Math.max(maxWidth, width);
    if (width > availableWidth) {
      return { fits: false, maxWidth };
    }
  }
  
  return { fits: true, maxWidth };
}
