import type { WordAnalysis, WordConfidence, Morphology } from '../types';

interface Props {
  word: WordAnalysis;
  style?: React.CSSProperties;
}

const MORPH_KEYS: (keyof Morphology)[] = [
  'pos', 'case', 'number', 'gender', 'person', 'tense', 'mood', 'voice',
];

const CONFIDENCE_STYLES: Record<WordConfidence, string> = {
  full:       'bg-green-100 text-green-700',
  no_meaning: 'bg-yellow-100 text-yellow-700',
  form_only:  'bg-gray-100 text-gray-500',
};

const CONFIDENCE_LABELS: Record<WordConfidence, string> = {
  full:       'full',
  no_meaning: 'no meaning',
  form_only:  'form only',
};

export function WordTooltip({ word, style }: Props) {
  const morph = word.morphology ?? {};
  const morphRows = MORPH_KEYS.filter(k => morph[k]);

  return (
    <div
      style={style}
      className="fixed z-50 w-64 rounded-lg border border-gray-200 bg-white shadow-lg text-xs pointer-events-none"
    >
      <div className="p-3 space-y-2">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-semibold text-sm text-gray-900">{word.form}</span>
          {word.lemma && word.lemma !== word.form && (
            <span className="text-gray-500 italic">{word.lemma}</span>
          )}
          {word.dictionary_form && (
            <span className="text-gray-400 text-[10px]">{word.dictionary_form}</span>
          )}
        </div>

        {word.meaning && (
          <p className="text-gray-700 border-t border-gray-100 pt-2">{word.meaning}</p>
        )}

        {morphRows.length > 0 && (
          <table className="w-full border-t border-gray-100 pt-2">
            <tbody>
              {morphRows.map(k => (
                <tr key={k}>
                  <td className="text-gray-400 pr-2 py-0.5 capitalize w-20">{k}</td>
                  <td className="text-gray-700 font-medium">{morph[k]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="flex items-center gap-2 border-t border-gray-100 pt-2 flex-wrap">
          {word.syntactic_role && (
            <span className="text-gray-600">{word.syntactic_role}</span>
          )}
          <span className={`ml-auto rounded-full px-2 py-0.5 ${CONFIDENCE_STYLES[word.confidence]}`}>
            {CONFIDENCE_LABELS[word.confidence]}
          </span>
        </div>
      </div>
    </div>
  );
}
