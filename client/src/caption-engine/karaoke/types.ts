import { z } from "zod";

export const karaokeStyleSchema = z.enum([
  "weight",
  "brightness", 
  "underline",
  "color",
  "scale",
  "glow",
]);

export type KaraokeStyle = z.infer<typeof karaokeStyleSchema>;

export interface WordHighlightState {
  wordIndex: number;
  progress: number;
  isActive: boolean;
  isPast: boolean;
}

export interface KaraokeState {
  activeWordIndex: number;
  wordProgress: number;
  highlightedWords: WordHighlightState[];
}

export interface KaraokeConfig {
  style: KaraokeStyle;
  activeColor?: string;
  inactiveColor?: string;
  transitionMs: number;
  highlightAhead: boolean;
}

export const defaultKaraokeConfig: KaraokeConfig = {
  style: "weight",
  transitionMs: 80,
  highlightAhead: false,
};
