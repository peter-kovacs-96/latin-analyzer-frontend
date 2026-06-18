import type { SentenceChunk, WordAnalysis } from './types';

// Builds a ready-to-paste AI prompt from the (English-language) analysis so a
// capable model can translate the Latin into Hungarian with high fidelity,
// guided by the exact morphology rather than guessing.

const TARGET_LANGUAGE = 'HUNGARIAN (magyar)';

const HEADER = `You are an expert Latin philologist. Work with the Latin text below and its
precise, automated per-token analysis (dictionary form, English gloss,
morphological features, syntactic role). Produce THREE sections, in this order.

SECTION 1 — Faithful rendering (strictly per the analysis)
Translate the whole text into ${TARGET_LANGUAGE}, rendering every word exactly as its
given part of speech, case, number, gender, tense, mood, voice and gloss dictate
— even if the result is awkward or barely makes sense. Use ONLY the provided
analysis here; do not apply your own knowledge of Latin to "fix" anything, and
stay within the senses listed in each gloss. Preserve the line structure exactly;
blank lines mark stanza/section breaks. This section validates the analysis
against the source.

SECTION 2 — Analysis observations
List every token whose given analysis looks wrong, internally inconsistent, or
yields something ungrammatical or nonsensical in context. For each give: the
form, its given analysis, and what the Latin actually requires (correct
case / part of speech / sense), with one line of reasoning. If nothing is wrong,
write "none".

SECTION 3 — Corrected translation (the usable one)
Re-translate into natural, accurate ${TARGET_LANGUAGE}. Override ONLY the tokens you
listed in Section 2, using their corrected reading; keep every other word exactly
as in Section 1. Stay faithful and literal — do not paraphrase loosely, embellish,
or add/drop content. Preserve the line structure. This is the final translation.

Punctuation is shown in each source line (the "L… |" lines); reproduce it sensibly.`;

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
