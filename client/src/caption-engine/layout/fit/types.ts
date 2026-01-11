export interface FitSettings {
  maxLines: 1 | 2 | 3;
  panelMaxWidthPercent: number;
  baseFontSize: number;
  minFontSize: number;
  padding: number;
  lineHeight: number;
}

export interface FitResult {
  lines: string[];
  fontSize: number;
  lineCount: number;
  panelWidth: number;
  fitted: boolean;
  warning: string | null;
  iterations: number;
  overflowLog: string[];
}

export interface LineComposition {
  lines: string[];
  score: number;
}
