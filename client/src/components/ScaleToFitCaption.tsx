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

  // Safe inset constants - explicit padding for inner safe area
  const padX = 24;
  const padY = 20;
  const measurementFudge = 8; // Extra safety margin to prevent edge clipping
  
  const panelMaxWidthPercent = 92;
  const panelWidthPx = containerWidthPx * (panelMaxWidthPercent / 100);
  const panelMinHeight = 120;
  
  // Fit to INNER rectangle (panel minus padding minus fudge)
  const innerWidth = panelWidthPx - (padX * 2) - measurementFudge;
  const innerHeight = panelMinHeight - (padY * 2);

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

      const scaleX = innerWidth / scrollW;
      const scaleY = innerHeight / scrollH;
      const newScale = Math.min(scaleX, scaleY, 1);

      setScale(Math.max(newScale, 0.25));
    };

    requestAnimationFrame(measure);
  }, [lines, innerWidth, innerHeight, fittedFontSizePx]);

  const lineStyle: CSSProperties = {
    ...textStyle,
    fontSize: `${fittedFontSizePx}px`,
    whiteSpace: "nowrap",
    margin: 0,
    display: "block",
  };

  return (
    <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
      {/* OuterPanel: rounded, overflow hidden, fixed size */}
      <div
        style={{
          ...panelStyle,
          position: "relative",
          width: `${panelMaxWidthPercent}%`,
          minHeight: `${panelMinHeight}px`,
          boxSizing: "border-box",
          overflow: "hidden",
        }}
        data-testid="caption-panel"
      >
        {/* InnerSafeArea: uses explicit padding */}
        <div
          style={{
            position: "absolute",
            top: padY,
            left: padX,
            right: padX,
            bottom: padY,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* CentreAnchor: 50/50 positioning */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              maxWidth: "100%",
            }}
          >
            {/* TransformWrapper: translate + scale */}
            <div
              style={{
                transform: `translate(-50%, -50%) scale(${scale})`,
                transformOrigin: "center center",
              }}
            >
              {/* TextBlock: centered text content */}
              <div
                ref={textRef}
                style={{
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1.15,
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
          {didFit ? "✓" : "✗"} {fittedFontSizePx}px × {(scale * 100).toFixed(0)}% | {lines.length}L | inner:{Math.round(innerWidth)}w
        </div>
      )}
    </div>
  );
}
