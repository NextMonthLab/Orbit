import { cn } from "@/lib/utils";
import React from "react";

type SkinType = "noise" | "orbitGrid" | "spotlight" | "vignette";

interface SectionSkinProps {
  children: React.ReactNode;
  skins?: SkinType[];
  spotlightColor?: string;
  spotlightPosition?: "top" | "center" | "bottom";
  gridOpacity?: number;
  className?: string;
  as?: "section" | "div" | "article" | "aside" | "header" | "footer";
  id?: string;
  separator?: "border" | "gradient" | "none";
}

const orbitGridSvg = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1' fill='%23ffffff'/%3E%3C/svg%3E")`;

export default function SectionSkin({
  children,
  skins = [],
  spotlightColor = "rgba(59, 130, 246, 0.15)",
  spotlightPosition = "top",
  gridOpacity = 0.05,
  className,
  as: Component = "section",
  id,
  separator = "none",
}: SectionSkinProps) {
  const hasNoise = skins.includes("noise");
  const hasOrbitGrid = skins.includes("orbitGrid");
  const hasSpotlight = skins.includes("spotlight");
  const hasVignette = skins.includes("vignette");

  const spotlightPositionStyles = {
    top: "radial-gradient(ellipse 80% 50% at 50% 0%,",
    center: "radial-gradient(ellipse 60% 40% at 50% 50%,",
    bottom: "radial-gradient(ellipse 80% 50% at 50% 100%,",
  };

  const separatorStyles = {
    border: "border-t border-white/[0.06]",
    gradient: "",
    none: "",
  };

  const Wrapper = Component as React.ElementType;
  
  return (
    <Wrapper
      id={id}
      className={cn(
        "relative overflow-hidden",
        separatorStyles[separator],
        className
      )}
    >
      {/* Noise layer */}
      {hasNoise && (
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            opacity: 0.03,
            mixBlendMode: "overlay",
          }}
        />
      )}

      {/* Orbit grid layer */}
      {hasOrbitGrid && (
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: orbitGridSvg,
            backgroundSize: "40px 40px",
            opacity: gridOpacity,
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black 0%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black 0%, transparent 70%)",
          }}
        />
      )}

      {/* Spotlight layer */}
      {hasSpotlight && (
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: `${spotlightPositionStyles[spotlightPosition]} ${spotlightColor} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Vignette layer */}
      {hasVignette && (
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, rgba(0,0,0,0.4) 100%)",
          }}
        />
      )}

      {/* Gradient separator (rendered at top) */}
      {separator === "gradient" && (
        <div
          className="pointer-events-none absolute top-0 left-0 right-0 h-px z-0"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.1) 70%, transparent 100%)",
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </Wrapper>
  );
}

export function SectionDivider({ variant = "gradient" }: { variant?: "border" | "gradient" }) {
  if (variant === "border") {
    return <div className="h-px bg-white/[0.06]" />;
  }

  return (
    <div
      className="h-px"
      style={{
        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent 100%)",
      }}
    />
  );
}
