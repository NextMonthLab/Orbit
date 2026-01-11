import React from "react";
import type { CSSProperties } from "react";

interface FitGeometry {
  panelWidthPx: number;
  paddingPx: number;
  panelMaxWidthPercent: number;
}

interface ScaleToFitCaptionProps {
  lines: string[];
  panelStyle: CSSProperties;
  textStyle: CSSProperties;
  containerWidthPx: number;
  fittedFontSizePx: number;
  didFit?: boolean;
  showDebug?: boolean;
  fitGeometry?: FitGeometry;
}

export function ScaleToFitCaption({
  lines,
  panelStyle,
  textStyle,
  containerWidthPx,
  fittedFontSizePx,
  didFit = true,
  showDebug = false,
  fitGeometry,
}: ScaleToFitCaptionProps) {
  // Use EXACT values from fit engine
  const padding = fitGeometry?.paddingPx ?? 16;
  const panelWidthPx = fitGeometry?.panelWidthPx ?? (containerWidthPx * 0.92);
  
  // Same calculation as fit engine: (panelWidth - 2*padding) * 0.92
  const safetyMargin = 0.08;
  const innerWidthPx = Math.floor((panelWidthPx - (padding * 2)) * (1 - safetyMargin));
  
  // Bubble padding (visual)
  const bubblePadding = 24;

  const lineStyle: CSSProperties = {
    ...textStyle,
    fontSize: `${fittedFontSizePx}px`,
    whiteSpace: "nowrap",
    margin: 0,
    display: "block",
    textAlign: "center",
  };

  return (
    <div style={{ 
      position: "relative", 
      width: "100%", 
      display: "flex", 
      justifyContent: "center" 
    }}>
      {/* Bubble: exact width from fit engine, centered */}
      <div
        style={{
          ...panelStyle,
          width: `${innerWidthPx}px`,
          maxWidth: `${innerWidthPx}px`,
          minWidth: `${innerWidthPx}px`,
          padding: `${bubblePadding}px`,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: "auto",
          marginRight: "auto",
        }}
        data-testid="caption-panel"
      >
        {/* Text wrapper: fills bubble minus padding */}
        <div
          style={{
            width: "100%",
            maxWidth: `${innerWidthPx - (bubblePadding * 2)}px`,
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
          {didFit ? "✓" : "✗"} {fittedFontSizePx}px | {lines.length}L | bubble:{innerWidthPx}px
        </div>
      )}
    </div>
  );
}
