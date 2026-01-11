import React, { useRef, useEffect, useState } from "react";
import type { CSSProperties } from "react";

interface ScaleToFitCaptionProps {
  lines: string[];
  panelStyle: CSSProperties;
  textStyle: CSSProperties;
  containerWidthPx: number;
  maxHeightPx?: number;
}

export function ScaleToFitCaption({
  lines,
  panelStyle,
  textStyle,
  containerWidthPx,
  maxHeightPx = 200,
}: ScaleToFitCaptionProps) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [scale, setScale] = useState(1);

  const panelWidthPx = containerWidthPx * 0.92;
  const paddingPx = 16;
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

      setScale(Math.max(newScale, 0.4));
    };

    requestAnimationFrame(measure);
  }, [lines, availableWidth, availableHeight]);

  const baseTextStyle: CSSProperties = {
    ...textStyle,
    fontSize: "48px",
    display: "block",
    overflow: "visible",
    textOverflow: "clip",
    whiteSpace: "pre-line",
    wordBreak: "keep-all",
    overflowWrap: "normal",
    hyphens: "none",
    transformOrigin: "center center",
    transform: `scale(${scale})`,
  };

  return (
    <div
      style={{
        ...panelStyle,
        maxWidth: `${92}%`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        minHeight: "60px",
      }}
      data-testid="caption-panel"
    >
      <p ref={textRef} className="m-0" style={baseTextStyle} data-testid="text-headline">
        {lines.map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
    </div>
  );
}
