import type { WordAnalysis, WordConfidence, Morphology, DownstreamDiagnostic, Lang } from '../types';
import { useDebug } from '../DebugContext';
import { useLang } from '../LangContext';

interface Props {
  word: WordAnalysis;
  style?: React.CSSProperties;
  pinned?: boolean;
  onClose?: () => void;
}

const MORPH_KEYS: (keyof Morphology)[] = [
  'pos', 'case', 'number', 'gender', 'person', 'tense', 'mood', 'voice',
];

const CONFIDENCE_STYLES: Record<WordConfidence, string> = {
  full:       'bg-green-100 text-green-700',
  no_meaning: 'bg-yellow-100 text-yellow-700',
  form_only:  'bg-gray-100 text-gray-500',
};

const CONFIDENCE_LABELS: Record<Lang, Record<WordConfidence, string>> = {
  en: { full: 'full',    no_meaning: 'no meaning',       form_only: 'form only' },
  hu: { full: 'teljes',  no_meaning: 'hiányzó jelentés', form_only: 'csak alak' },
};

const SVC_SHORT: Record<string, string> = {
  udpipe:           'UDPipe',
  latin_wordnet:    'WordNet',
  latin_is_simple:  'LIS',
  morpheus:         'Morpheus',
};

const STATUS_STYLE: Record<string, string> = {
  ok:               'text-green-600',
  not_found:        'text-gray-400',
  skipped:          'text-gray-300',
};

function DiagRow({ svc, diag }: { svc: string; diag: DownstreamDiagnostic }) {
  const label = SVC_SHORT[svc] ?? svc;
  const isError = !['ok', 'not_found', 'skipped'].includes(diag.status);
  const cls = isError ? 'text-red-500 font-medium' : (STATUS_STYLE[diag.status] ?? 'text-gray-500');
  const detail = diag.cached ? 'cached' : diag.latency_ms != null ? `${diag.latency_ms}ms` : '';
  return (
    <tr>
      <td className="text-gray-400 pr-2 py-0.5 w-16">{label}</td>
      <td className={`py-0.5 ${cls}`}>{diag.status}</td>
      {detail && <td className="text-gray-300 pl-2 py-0.5">{detail}</td>}
    </tr>
  );
}

export function WordTooltip({ word, style, pinned, onClose }: Props) {
  const debug = useDebug();
  const lang = useLang();
  const morph = word.morphology ?? {};
  const morphRows = MORPH_KEYS.filter(k => morph[k]);

  return (
    <div
      style={style}
      className="fixed z-50 w-64 rounded-lg border border-gray-200 bg-white shadow-lg text-xs"
      // stop click inside tooltip from bubbling to document (which might close it)
      onClick={e => e.stopPropagation()}
    >
      <div className="p-3 space-y-2">
        {/* Header row: form + LIS link + close button */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-semibold text-sm text-gray-900">{word.form}</span>
            {word.lemma && word.lemma !== word.form && (
              <span className="text-gray-500 italic">{word.lemma}</span>
            )}
            {word.dictionary_form && (
              <span className="text-gray-400 text-[10px]">{word.dictionary_form}</span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {word.lis_url && (
              <a
                href={word.lis_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex items-center justify-center w-5 h-5 rounded hover:bg-gray-100 text-gray-300 hover:text-blue-500 transition-colors"
                title="Open in Latin is Simple"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            {pinned && onClose && (
              <button
                onClick={onClose}
                className="flex items-center justify-center w-5 h-5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                ×
              </button>
            )}
          </div>
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
            {CONFIDENCE_LABELS[lang][word.confidence]}
          </span>
        </div>

        {debug && word.downstreams && Object.keys(word.downstreams).length > 0 && (
          <table className="w-full border-t border-gray-100 pt-2">
            <tbody>
              {Object.entries(word.downstreams).map(([svc, diag]) => (
                <DiagRow key={svc} svc={svc} diag={diag} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
