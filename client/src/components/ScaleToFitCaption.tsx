import React, { useRef, useEffect, useState } from "react";
import type { CSSProperties } from "react";

interface ScaleToFitCaptionProps {
  lines: string[];
  panelStyle: CSSProperties;
  textStyle: CSSProperties;
  containerWidthPx: number;
  maxHeightPx?: number;
  fittedFontSizePx: number;
  didFit?: boolean;
  showDebug?: boolean;
}

export function ScaleToFitCaption({
  lines,
  panelStyle,
  textStyle,
  containerWidthPx,
  maxHeightPx = 200,
  fittedFontSizePx,
  didFit = true,
  showDebug = false,
}: ScaleToFitCaptionProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const panelMaxWidthPercent = 92;
  const panelWidthPx = containerWidthPx * (panelMaxWidthPercent / 100);
  const paddingPx = 18;
  const availableWidth = panelWidthPx - paddingPx * 2;
  const availableHeight = maxHeightPx - paddingPx * 2;

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const measure = () => {
      const scrollW = el.scrollWidth;
      const scrollH = el.scrollHeight;

      if (scrollW === 0 || scrollH === 0) {
        setScale(1);
        return;
      }

      const scaleX = availableWidth / scrollW;
      const scaleY = availableHeight / scrollH;
      const newScale = Math.min(scaleX, scaleY, 1);

      setScale(Math.max(newScale, 0.2));
    };

    requestAnimationFrame(measure);
  }, [lines, availableWidth, availableHeight, fittedFontSizePx]);

  const lineStyle: CSSProperties = {
    ...textStyle,
    fontSize: `${fittedFontSizePx}px`,
    whiteSpace: "nowrap",
    margin: 0,
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Panel (the box) */}
      <div
        style={{
          ...panelStyle,
          width: "100%",
          maxWidth: `${panelMaxWidthPercent}%`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: `${paddingPx}px 20px`,
          boxSizing: "border-box",
          minHeight: "60px",
          overflow: "hidden",
        }}
        data-testid="caption-panel"
      >
        {/* Scale wrapper: THIS is what we scale */}
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {/* Text block: centred, constrained */}
          <div
            ref={textRef}
            style={{
              width: "100%",
              maxWidth: "92%",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1.12,
            }}
            data-testid="text-headline"
          >
            {lines.map((line, i) => (
              <div key={i} style={lineStyle}>
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
      {showDebug && (
        <div
          style={{
            position: "absolute",
            bottom: "-24px",
            left: "50%",
            transform: "translateX(-50%)",
            background: didFit ? "rgba(0,200,0,0.9)" : "rgba(255,100,0,0.9)",
            color: "white",
            fontSize: "10px",
            fontFamily: "monospace",
            padding: "2px 6px",
            borderRadius: "4px",
            whiteSpace: "nowrap",
          }}
        >
          {didFit ? "✓" : "✗"} {fittedFontSizePx}px × {(scale * 100).toFixed(0)}% | {lines.length}L | {Math.round(panelWidthPx)}w
        </div>
      )}
    </div>
  );
}
