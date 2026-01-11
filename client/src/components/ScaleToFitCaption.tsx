import React from "react";
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
  fittedFontSizePx,
  didFit = true,
  showDebug = false,
}: ScaleToFitCaptionProps) {
  // Use exact values from fit engine - NO transforms, just font-size
  const padX = 20;
  const padY = 16;
  const panelMaxWidthPercent = 92;
  const panelWidthPx = containerWidthPx * (panelMaxWidthPercent / 100);
  const innerWidth = panelWidthPx - (padX * 2);

  const lineStyle: CSSProperties = {
    ...textStyle,
    fontSize: `${fittedFontSizePx}px`,
    whiteSpace: "nowrap",
    margin: 0,
    display: "block",
    textAlign: "center",
  };

  return (
    <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
      {/* Panel: fixed width, auto height, centered */}
      <div
        style={{
          ...panelStyle,
          width: `${panelWidthPx}px`,
          padding: `${padY}px ${padX}px`,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        data-testid="caption-panel"
      >
        {/* Text container: exact inner width, no overflow */}
        <div
          style={{
            width: `${innerWidth}px`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1.15,
            overflow: "hidden",
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
          {didFit ? "✓" : "✗"} {fittedFontSizePx}px | {lines.length}L | {Math.round(innerWidth)}w
        </div>
      )}
    </div>
  );
}
