export type SafeAreaProfile = "universal" | "tiktok" | "instagram_reels" | "youtube_shorts";

export type CaptionPresetId = 
  | "clean_white"
  | "clean_black"
  | "boxed_white"
  | "boxed_black"
  | "highlight_yellow"
  | "highlight_pink"
  | "typewriter"
  | "gradient_purple"
  | "neon_blue"
  | "minimal_shadow"
  | "bold_impact"
  | "elegant_serif";

export type AnimationId = "none" | "fade" | "slide_up" | "pop" | "typewriter";

export type KaraokeStyleId = "weight" | "brightness" | "underline" | "color" | "scale" | "glow";

export interface WordTiming {
  word: string;
  startMs: number;
  endMs: number;
  confidence?: number;
}

export interface PhraseGroup {
  id: string;
  segmentIds: string[];
  displayText: string;
  lines: string[];
  startMs: number;
  endMs: number;
  words?: WordTiming[];
  karaokeEligible: boolean;
}

export interface CaptionOverrides {
  fontSizeScale?: number;
  verticalOffset?: number;
  backgroundEnabled?: boolean;
  karaokeEnabled?: boolean;
}

export interface CaptionState {
  schemaVersion: number;
  tokenVersion: number;
  presetId: CaptionPresetId;
  animationId: AnimationId;
  titlePresetId?: string;
  safeAreaProfileId: SafeAreaProfile;
  karaokeRequested: boolean;
  karaokeEffective: boolean;
  karaokeEnabled: boolean;
  karaokeStyle: KaraokeStyleId;
  karaokeConfidenceThreshold: number;
  transcriptionProvider?: string;
  transcriptionConfidence?: number;
  segments: CaptionSegment[];
  phraseGroups: PhraseGroup[];
  overrides?: CaptionOverrides;
  createdAt?: string;
  updatedAt?: string;
}

export interface CaptionSegment {
  id: string;
  text: string;
  startMs: number;
  endMs: number;
  words?: WordTiming[];
  speakerId?: string;
}
