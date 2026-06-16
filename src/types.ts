export interface Morphology {
  pos?: string | null;
  case?: string | null;
  number?: string | null;
  gender?: string | null;
  person?: string | null;
  tense?: string | null;
  mood?: string | null;
  voice?: string | null;
}

export type WordConfidence = 'full' | 'no_meaning' | 'form_only';

export interface WordAnalysis {
  form: string;
  lemma: string | null;
  upos: string;
  dictionary_form: string;
  meaning: string;
  morphology: Morphology;
  syntactic_role: string | null;
  confidence: WordConfidence;
  source: string;
  lis_url: string;
}

export interface AnalysisSummary {
  used_udpipe: boolean;
  word_count: number;
  partial_failure: boolean;
}

export interface LineData {
  line_number: number;
  text: string;
  request_id: string;
  summary: AnalysisSummary;
  words: WordAnalysis[];
}

export interface SentenceChunk {
  sentence_number: number;
  lines: LineData[];
}

export interface EmptyLine {
  line_number: number;
  empty: true;
}

export type StreamChunk = SentenceChunk | EmptyLine;

export interface RecentFile {
  name: string;
  content: string;
  timestamp: number;
}

export type Lang = 'hu' | 'en';
export type Mode = 'sentence' | 'stanza';
