export interface WordFeats {
  Case?: string;
  Number?: string;
  Gender?: string;
  Person?: string;
  Tense?: string;
  Mood?: string;
  Voice?: string;
  Degree?: string;
  VerbForm?: string;
  [key: string]: string | undefined;
}

export interface WordToken {
  id: number;
  form: string;
  lemma: string;
  upos: string;
  xpos?: string;
  dictionary_form?: string;
  meaning?: string;
  feats?: WordFeats;
  syntactic_role?: string;
  confidence?: number;
  head?: number;
  deprel?: string;
}

export interface LineData {
  line_number: number;
  tokens: WordToken[];
  text?: string;
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
