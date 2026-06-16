import type { WordToken } from '../types';

interface Props {
  word: WordToken;
}

const MORPH_KEYS = [
  'Case', 'Number', 'Gender', 'Person', 'Tense', 'Mood', 'Voice', 'Degree', 'VerbForm',
] as const;

export function WordTooltip({ word }: Props) {
  const feats = word.feats ?? {};
  const morphRows = MORPH_KEYS.filter(k => feats[k]);

  const confidence = word.confidence;
  const confidenceColor =
    confidence === undefined ? 'bg-gray-100 text-gray-500' :
    confidence >= 0.9 ? 'bg-green-100 text-green-700' :
    confidence >= 0.7 ? 'bg-yellow-100 text-yellow-700' :
    'bg-red-100 text-red-700';

  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 rounded-lg border border-gray-200 bg-white shadow-lg text-xs pointer-events-none">
      {/* Arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-200" />
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[-1px] border-4 border-transparent border-t-white" />

      <div className="p-3 space-y-2">
        {/* Header: form / lemma */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-semibold text-sm text-gray-900">{word.form}</span>
          {word.lemma && word.lemma !== word.form && (
            <span className="text-gray-500 italic">{word.lemma}</span>
          )}
          {word.dictionary_form && word.dictionary_form !== word.lemma && (
            <span className="text-gray-400">({word.dictionary_form})</span>
          )}
        </div>

        {/* Meaning */}
        {word.meaning && (
          <p className="text-gray-700 border-t border-gray-100 pt-2">{word.meaning}</p>
        )}

        {/* Morphology table */}
        {morphRows.length > 0 && (
          <table className="w-full border-t border-gray-100 pt-2">
            <tbody>
              {morphRows.map(k => (
                <tr key={k}>
                  <td className="text-gray-400 pr-2 py-0.5 w-20">{k}</td>
                  <td className="text-gray-700 font-medium">{feats[k]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Syntactic role + confidence */}
        {(word.syntactic_role || confidence !== undefined) && (
          <div className="flex items-center gap-2 border-t border-gray-100 pt-2 flex-wrap">
            {word.syntactic_role && (
              <span className="text-gray-600">{word.syntactic_role}</span>
            )}
            {confidence !== undefined && (
              <span className={`ml-auto rounded-full px-2 py-0.5 font-mono ${confidenceColor}`}>
                {(confidence * 100).toFixed(0)}%
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
