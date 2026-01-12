import type { KaraokeStyle, WordHighlightState, KaraokeConfig } from "./types";
import React from "react";

export interface KaraokeStyleResult {
  style: React.CSSProperties;
  className?: string;
}

function interpolate(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

export function getWeightStyle(
  state: WordHighlightState,
  config: KaraokeConfig
): KaraokeStyleResult {
  const baseWeight = 400;
  const activeWeight = 700;
  
  let fontWeight = baseWeight;
  if (state.isPast || state.isActive) {
    fontWeight = activeWeight;
  } else if (state.progress > 0) {
    fontWeight = interpolate(baseWeight, activeWeight, state.progress);
  }
  
  return {
    style: {
      fontWeight,
      transition: `font-weight ${config.transitionMs}ms ease-out`,
    },
  };
}

export function getBrightnessStyle(
  state: WordHighlightState,
  config: KaraokeConfig
): KaraokeStyleResult {
  const inactiveOpacity = 0.5;
  const activeOpacity = 1;
  
  let opacity = inactiveOpacity;
  if (state.isPast || state.isActive) {
    opacity = activeOpacity;
  } else if (state.progress > 0) {
    opacity = interpolate(inactiveOpacity, activeOpacity, state.progress);
  }
  
  return {
    style: {
      opacity,
      transition: `opacity ${config.transitionMs}ms ease-out`,
    },
  };
}

export function getUnderlineStyle(
  state: WordHighlightState,
  config: KaraokeConfig
): KaraokeStyleResult {
  const isHighlighted = state.isPast || state.isActive;
  
  return {
    style: {
      textDecoration: isHighlighted ? "underline" : "none",
      textDecorationThickness: "2px",
      textUnderlineOffset: "4px",
      transition: `text-decoration ${config.transitionMs}ms ease-out`,
    },
  };
}

export function getColorStyle(
  state: WordHighlightState,
  config: KaraokeConfig
): KaraokeStyleResult {
  const activeColor = config.activeColor || "#FFE500";
  const inactiveColor = config.inactiveColor || "#FFFFFF";
  
  const isHighlighted = state.isPast || state.isActive;
  
  return {
    style: {
      color: isHighlighted ? activeColor : inactiveColor,
      transition: `color ${config.transitionMs}ms ease-out`,
    },
  };
}

export function getScaleStyle(
  state: WordHighlightState,
  config: KaraokeConfig
): KaraokeStyleResult {
  const baseScale = 1;
  const activeScale = 1.1;
  
  let scale = baseScale;
  if (state.isActive) {
    scale = activeScale;
  } else if (state.progress > 0 && !state.isPast) {
    scale = interpolate(baseScale, activeScale, state.progress);
  }
  
  return {
    style: {
      display: "inline-block",
      transform: `scale(${scale})`,
      transition: `transform ${config.transitionMs}ms ease-out`,
    },
  };
}

export function getGlowStyle(
  state: WordHighlightState,
  config: KaraokeConfig
): KaraokeStyleResult {
  const activeColor = config.activeColor || "#00FFFF";
  const isHighlighted = state.isPast || state.isActive;
  
  const glowIntensity = state.isActive ? 1 : state.isPast ? 0.6 : 0;
  const shadow = glowIntensity > 0 
    ? `0 0 ${10 * glowIntensity}px ${activeColor}, 0 0 ${20 * glowIntensity}px ${activeColor}`
    : "none";
  
  return {
    style: {
      textShadow: shadow,
      transition: `text-shadow ${config.transitionMs}ms ease-out`,
    },
  };
}

export function getKaraokeStyle(
  style: KaraokeStyle,
  state: WordHighlightState,
  config: KaraokeConfig
): KaraokeStyleResult {
  switch (style) {
    case "weight":
      return getWeightStyle(state, config);
    case "brightness":
      return getBrightnessStyle(state, config);
    case "underline":
      return getUnderlineStyle(state, config);
    case "color":
      return getColorStyle(state, config);
    case "scale":
      return getScaleStyle(state, config);
    case "glow":
      return getGlowStyle(state, config);
    default:
      return { style: {} };
  }
}
