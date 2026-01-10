import type { CaptionState, PhraseGroup, CaptionPresetId, KaraokeStyleId, SafeAreaProfile } from "@shared/captionTypes";

interface ASSStyle {
  name: string;
  fontName: string;
  fontSize: number;
  primaryColor: string;
  secondaryColor: string;
  outlineColor: string;
  backColor: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikeOut: boolean;
  scaleX: number;
  scaleY: number;
  spacing: number;
  angle: number;
  borderStyle: number;
  outline: number;
  shadow: number;
  alignment: number;
  marginL: number;
  marginR: number;
  marginV: number;
  encoding: number;
}

const SAFE_AREA_MARGINS: Record<SafeAreaProfile, { marginV: number; marginL: number; marginR: number }> = {
  universal: { marginV: 80, marginL: 40, marginR: 40 },
  tiktok: { marginV: 200, marginL: 40, marginR: 40 },
  instagram_reels: { marginV: 180, marginL: 40, marginR: 40 },
  youtube_shorts: { marginV: 160, marginL: 40, marginR: 40 },
};

const PRESET_STYLES: Record<CaptionPresetId, Partial<ASSStyle>> = {
  clean_white: {
    fontName: "Arial",
    fontSize: 48,
    primaryColor: "&H00FFFFFF",
    outlineColor: "&H00000000",
    backColor: "&H00000000",
    bold: false,
    outline: 2,
    shadow: 1,
  },
  clean_black: {
    fontName: "Arial",
    fontSize: 48,
    primaryColor: "&H00000000",
    outlineColor: "&H00FFFFFF",
    backColor: "&H00000000",
    bold: false,
    outline: 2,
    shadow: 0,
  },
  boxed_white: {
    fontName: "Arial",
    fontSize: 44,
    primaryColor: "&H00FFFFFF",
    outlineColor: "&H00000000",
    backColor: "&H80000000",
    bold: false,
    borderStyle: 3,
    outline: 0,
    shadow: 0,
  },
  boxed_black: {
    fontName: "Arial",
    fontSize: 44,
    primaryColor: "&H00000000",
    outlineColor: "&H00FFFFFF",
    backColor: "&H80FFFFFF",
    bold: false,
    borderStyle: 3,
    outline: 0,
    shadow: 0,
  },
  highlight_yellow: {
    fontName: "Impact",
    fontSize: 52,
    primaryColor: "&H00000000",
    outlineColor: "&H0000D7FF",
    backColor: "&H0000D7FF",
    bold: true,
    borderStyle: 3,
    outline: 0,
    shadow: 0,
  },
  highlight_pink: {
    fontName: "Impact",
    fontSize: 52,
    primaryColor: "&H00FFFFFF",
    outlineColor: "&H009932CC",
    backColor: "&H009932CC",
    bold: true,
    borderStyle: 3,
    outline: 0,
    shadow: 0,
  },
  typewriter: {
    fontName: "Courier New",
    fontSize: 40,
    primaryColor: "&H00FFFFFF",
    outlineColor: "&H00000000",
    backColor: "&H60000000",
    bold: false,
    borderStyle: 3,
    outline: 0,
    shadow: 0,
  },
  gradient_purple: {
    fontName: "Arial Black",
    fontSize: 50,
    primaryColor: "&H00FFFFFF",
    outlineColor: "&H00FF5C8B",
    backColor: "&H00EF5CF6",
    bold: true,
    borderStyle: 3,
    outline: 0,
    shadow: 0,
  },
  neon_blue: {
    fontName: "Arial Black",
    fontSize: 50,
    primaryColor: "&H00FFAA60",
    outlineColor: "&H00FF6030",
    backColor: "&H00000000",
    bold: true,
    outline: 3,
    shadow: 0,
  },
  minimal_shadow: {
    fontName: "Arial",
    fontSize: 46,
    primaryColor: "&H00FFFFFF",
    outlineColor: "&H00000000",
    backColor: "&H00000000",
    bold: false,
    outline: 1,
    shadow: 2,
  },
  bold_impact: {
    fontName: "Impact",
    fontSize: 56,
    primaryColor: "&H00FFFFFF",
    outlineColor: "&H00000000",
    backColor: "&H00000000",
    bold: true,
    outline: 3,
    shadow: 1,
  },
  elegant_serif: {
    fontName: "Times New Roman",
    fontSize: 46,
    primaryColor: "&H00FFFFFF",
    outlineColor: "&H00000000",
    backColor: "&H00000000",
    bold: false,
    italic: true,
    outline: 1,
    shadow: 1,
  },
};

const KARAOKE_HIGHLIGHT_COLORS: Record<KaraokeStyleId, string> = {
  weight: "&H00FFFFFF",
  brightness: "&H0000FFFF",
  underline: "&H00FFFFFF",
  color: "&H000080FF",
  scale: "&H00FFFFFF",
  glow: "&H00FF80FF",
};

function formatTime(ms: number): string {
  const totalSeconds = ms / 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toFixed(2).padStart(5, "0")}`;
}

function createDefaultStyle(): ASSStyle {
  return {
    name: "Default",
    fontName: "Arial",
    fontSize: 48,
    primaryColor: "&H00FFFFFF",
    secondaryColor: "&H000000FF",
    outlineColor: "&H00000000",
    backColor: "&H00000000",
    bold: false,
    italic: false,
    underline: false,
    strikeOut: false,
    scaleX: 100,
    scaleY: 100,
    spacing: 0,
    angle: 0,
    borderStyle: 1,
    outline: 2,
    shadow: 1,
    alignment: 2,
    marginL: 40,
    marginR: 40,
    marginV: 80,
    encoding: 1,
  };
}

function styleToASSLine(style: ASSStyle): string {
  return `Style: ${style.name},${style.fontName},${style.fontSize},` +
    `${style.primaryColor},${style.secondaryColor},${style.outlineColor},${style.backColor},` +
    `${style.bold ? -1 : 0},${style.italic ? -1 : 0},${style.underline ? -1 : 0},${style.strikeOut ? -1 : 0},` +
    `${style.scaleX},${style.scaleY},${style.spacing},${style.angle},` +
    `${style.borderStyle},${style.outline},${style.shadow},` +
    `${style.alignment},${style.marginL},${style.marginR},${style.marginV},${style.encoding}`;
}

function generateKaraokeText(
  group: PhraseGroup,
  karaokeStyle: KaraokeStyleId,
  highlightColor: string
): string {
  if (!group.words || group.words.length === 0) {
    return group.displayText.replace(/\n/g, "\\N");
  }

  const parts: string[] = [];
  let prevEndMs = group.startMs;

  for (const word of group.words) {
    const gapDuration = Math.max(0, word.startMs - prevEndMs);
    if (gapDuration > 0) {
      const gapCenti = Math.round(gapDuration / 10);
      parts.push(`{\\k${gapCenti}}`);
    }

    const wordDuration = word.endMs - word.startMs;
    const wordCenti = Math.round(wordDuration / 10);

    let styleTag = "";
    switch (karaokeStyle) {
      case "weight":
        styleTag = `{\\kf${wordCenti}\\1c${highlightColor}}`;
        break;
      case "brightness":
        styleTag = `{\\kf${wordCenti}\\1c${highlightColor}\\bord3}`;
        break;
      case "underline":
        styleTag = `{\\kf${wordCenti}\\u1}`;
        break;
      case "color":
        styleTag = `{\\kf${wordCenti}\\1c${highlightColor}}`;
        break;
      case "scale":
        styleTag = `{\\kf${wordCenti}\\fscx120\\fscy120}`;
        break;
      case "glow":
        styleTag = `{\\kf${wordCenti}\\1c${highlightColor}\\bord4\\blur2}`;
        break;
      default:
        styleTag = `{\\kf${wordCenti}}`;
    }

    parts.push(`${styleTag}${word.word} `);
    prevEndMs = word.endMs;
  }

  return parts.join("").trim();
}

export interface ASSGeneratorOptions {
  width?: number;
  height?: number;
}

export function generateASSFromCaptionState(
  captionState: CaptionState,
  options: ASSGeneratorOptions = {}
): string {
  const { width = 1080, height = 1920 } = options;
  const presetId = captionState.presetId || "clean_white";
  const safeAreaProfile = captionState.safeAreaProfileId || "universal";
  const karaokeEnabled = captionState.karaokeEnabled || false;
  const karaokeStyle = captionState.karaokeStyle || "weight";

  const baseStyle = createDefaultStyle();
  const presetOverrides = PRESET_STYLES[presetId] || {};
  const safeAreaMargins = SAFE_AREA_MARGINS[safeAreaProfile];

  const style: ASSStyle = {
    ...baseStyle,
    ...presetOverrides,
    marginL: safeAreaMargins.marginL,
    marginR: safeAreaMargins.marginR,
    marginV: safeAreaMargins.marginV,
  };

  const highlightStyle: ASSStyle = {
    ...style,
    name: "Highlight",
    primaryColor: KARAOKE_HIGHLIGHT_COLORS[karaokeStyle],
  };

  const header = `[Script Info]
Title: ICE Caption Export
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709
PlayResX: ${width}
PlayResY: ${height}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
${styleToASSLine(style)}
${styleToASSLine(highlightStyle)}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;

  const events: string[] = [];
  const phraseGroups = captionState.phraseGroups || [];

  for (const group of phraseGroups) {
    const startTime = formatTime(group.startMs);
    const endTime = formatTime(group.endMs);

    let text: string;
    if (karaokeEnabled && group.words && group.words.length > 0) {
      text = generateKaraokeText(group, karaokeStyle, KARAOKE_HIGHLIGHT_COLORS[karaokeStyle]);
    } else {
      text = group.displayText.replace(/\n/g, "\\N");
    }

    let effect = "";
    const animationId = captionState.animationId || "fade";
    const fadeDuration = 200;

    switch (animationId) {
      case "fade":
        effect = `{\\fad(${fadeDuration},${fadeDuration})}`;
        break;
      case "slide_up":
        effect = `{\\move(${width / 2},${height - safeAreaMargins.marginV + 50},${width / 2},${height - safeAreaMargins.marginV},0,${fadeDuration})}`;
        break;
      case "pop":
        effect = `{\\fscx0\\fscy0\\t(0,${fadeDuration},\\fscx100\\fscy100)}`;
        break;
      case "typewriter":
        break;
      default:
        break;
    }

    events.push(`Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,${effect}${text}`);
  }

  return `${header}\n${events.join("\n")}`;
}

export function generateSRTFromCaptionState(captionState: CaptionState): string {
  const phraseGroups = captionState.phraseGroups || [];
  const lines: string[] = [];

  for (let i = 0; i < phraseGroups.length; i++) {
    const group = phraseGroups[i];
    const startTime = formatSRTTime(group.startMs);
    const endTime = formatSRTTime(group.endMs);
    const text = group.displayText.replace(/\n/g, "\n");

    lines.push(`${i + 1}`);
    lines.push(`${startTime} --> ${endTime}`);
    lines.push(text);
    lines.push("");
  }

  return lines.join("\n");
}

function formatSRTTime(ms: number): string {
  const totalSeconds = ms / 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const milliseconds = Math.round(ms % 1000);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")},${milliseconds.toString().padStart(3, "0")}`;
}
