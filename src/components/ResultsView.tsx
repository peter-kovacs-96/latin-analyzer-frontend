import type { SentenceChunk } from '../types';
import { SentenceBlock } from './SentenceBlock';

interface Props {
  sentences: SentenceChunk[];
  isStreaming: boolean;
  fileName: string;
}

function Spinner() {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400 mt-4">
      <svg
        className="animate-spin h-4 w-4 text-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      Analyzing…
    </div>
  );
}

const LEGEND = [
  { upos: 'NOUN', label: 'Noun', cls: 'bg-blue-100 text-blue-800 border border-blue-200' },
  { upos: 'VERB', label: 'Verb', cls: 'bg-red-100 text-red-800 border border-red-200' },
  { upos: 'ADJ',  label: 'Adj',  cls: 'bg-green-100 text-green-800 border border-green-200' },
  { upos: 'ADV',  label: 'Adv',  cls: 'bg-orange-100 text-orange-800 border border-orange-200' },
  { upos: 'PRON', label: 'Pron', cls: 'bg-purple-100 text-purple-800 border border-purple-200' },
  { upos: 'ADP',  label: 'Prep/Conj', cls: 'bg-gray-100 text-gray-600 border border-gray-200' },
];

export function ResultsView({ sentences, isStreaming, fileName }: Props) {
  if (!isStreaming && sentences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-300 select-none">
        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm">Upload a file to begin analysis</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-4">
      {/* Header row */}
      {(sentences.length > 0 || isStreaming) && (
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-sm font-medium text-gray-500 truncate">{fileName}</h2>
          {/* Legend */}
          <div className="flex flex-wrap gap-1.5">
            {LEGEND.map(l => (
              <span key={l.upos} className={`text-xs px-1.5 py-0.5 rounded ${l.cls}`}>
                {l.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sentences */}
      {sentences.map(s => (
        <SentenceBlock key={s.sentence_number} sentence={s} />
      ))}

      {/* Spinner while streaming */}
      {isStreaming && <Spinner />}
    </div>
  );
}
