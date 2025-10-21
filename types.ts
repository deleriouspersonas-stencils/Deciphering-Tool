export interface AnalysisPart {
  title: string;
  content: string;
}

export interface DecipherResult {
  analysisParts: AnalysisPart[];
  imageUrl: string;
}

export type AnalysisMode = 'quick' | 'grounded' | 'deep';
