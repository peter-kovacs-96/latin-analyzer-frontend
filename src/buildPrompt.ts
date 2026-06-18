import type { SentenceChunk, WordAnalysis } from './types';

// Builds a ready-to-paste AI prompt from the (English-language) analysis so a
// capable model can translate the Latin into Hungarian with high fidelity,
// guided by the exact morphology rather than guessing.

const TARGET_LANGUAGE = 'HUNGARIAN (magyar)';

const HEADER = `You are an expert Latin philologist. Translate the Latin text below into ${TARGET_LANGUAGE}.

The text comes with a precise, automated per-token analysis — dictionary form,
English gloss, morphological features, and syntactic role — that was carefully
produced and cross-checked. TREAT THIS ANALYSIS AS GROUND TRUTH and translate
strictly in accordance with it.

Hard rules:
1. Accuracy over fluency. Render the Latin as precisely as Hungarian grammar
   allows. Do not paraphrase loosely, do not embellish, do not add or drop
   content.
2. Never contradict the analysis. Your rendering of each word must agree with its
   given morphology (case, number, gender, tense, mood, voice) and syntactic
   role. The provided features OVERRIDE your own reading of the Latin: if you
   would have parsed the word differently (a different tense, case, person…),
   the provided features win — they were verified. Translate according to them,
   not according to what you assume the Latin form "should" be.
3. Use the English glosses as the authoritative meaning of each word. If a gloss
   lists several senses, choose the one that fits the syntax and context — but
   stay within the listed senses.
4. Do NOT hallucinate. If you are tempted to pick a reading not supported by the
   analysis, do not — flag it instead.
5. Tokens marked "(uncertain — surface form only)" or "(no gloss)" have no
   reliable dictionary data; infer them only from the immediate context and
   flag them explicitly.
6. Preserve the line structure exactly, line by line. Blank lines mark
   stanza/section breaks — keep them. Punctuation is shown in each source line
   (the "L… |" lines); reproduce it sensibly.

Output:
A) The Hungarian translation, aligned line-by-line to the source (one source
   line -> one output line).
B) A short "Notes" section listing every word where you disambiguated between
   senses, or where the analysis was uncertain/missing, with brief reasoning.`;

function features(word: WordAnalysis): string {
  const m = word.morphology ?? {};
  return [
    m.pos,
    m.case,
    m.number,
    m.gender,
    m.person ? `person ${m.person}` : null,
    m.tense,
    m.mood,
    m.voice,
  ]
    .filter(Boolean)
    .join(', ');
}

function wordLine(word: WordAnalysis): string {
  const gloss = word.meaning
    ? `"${word.meaning}"`
    : word.confidence === 'form_only'
      ? '(uncertain — surface form only)'
      : '(no gloss)';
  // dictionary_form is authoritative; fall back to the bare lemma only when LIS
  // gave no dictionary entry (e.g. words with no English meaning).
  const dict = word.dictionary_form
    ? ` [${word.dictionary_form}]`
    : word.lemma
      ? ` [lemma: ${word.lemma}]`
      : '';
  const feat = features(word);
  const role = word.syntactic_role ? ` =${word.syntactic_role}` : '';
  return `    • ${word.form} — ${gloss}${dict}${feat ? ` · ${feat}` : ''}${role}`;
}

export function buildTranslationPrompt(sentences: SentenceChunk[]): string {
  const body: string[] = [];
  let prevLineNumber = 0;

  for (const sentence of sentences) {
    body.push(`§${sentence.sentence_number}`);
    for (const line of sentence.lines) {
      // A gap in line numbers means blank line(s) were skipped — mark the break.
      if (prevLineNumber && line.line_number > prevLineNumber + 1) {
        body.push('   (blank line)');
      }
      prevLineNumber = line.line_number;

      body.push(`L${line.line_number} | ${line.text}`);
      for (const word of line.words) {
        if (word.upos === 'PUNCT') continue; // punctuation is kept in the line text
        body.push(wordLine(word));
      }
    }
    body.push('');
  }

  return `${HEADER}\n\n──────── SOURCE + ANALYSIS ────────\n\n${body.join('\n').trimEnd()}\n`;
}
