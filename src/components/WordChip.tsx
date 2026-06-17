import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { WordAnalysis, Lang } from '../types';
import { useLang } from '../LangContext';
import { WordTooltip } from './WordTooltip';

const ERROR_STATUSES = new Set([
  'timeout', 'network_error', 'http_error', 'rate_limited',
  'invalid_response', 'unavailable', 'unknown_error',
]);

interface Warning {
  level: 'error' | 'warn';
  title: string;
}

const WARNING_TEXT = {
  service_error: {
    en: (svcs: string) => `Service error (${svcs}) — morphology unconfirmed`,
    hu: (svcs: string) => `Szolgáltatáshiba (${svcs}) — a morfológia nincs megerősítve`,
  },
  not_found: {
    en: 'Word not found in any dictionary',
    hu: 'A szó egyik szótárban sem található',
  },
  no_meaning: {
    en: 'No translation found (Latin is Simple)',
    hu: 'Nincs fordítás (Latin is Simple)',
  },
} as const;

function getWarning(word: WordAnalysis, lang: Lang): Warning | null {
  if (word.confidence === 'full') return null;

  const ds = word.downstreams ?? {};
  const failedSvcs = Object.entries(ds)
    .filter(([, d]) => ERROR_STATUSES.has(d.status))
    .map(([svc]) => svc);

  if (word.confidence === 'form_only') {
    if (failedSvcs.length > 0) {
      return { level: 'error', title: WARNING_TEXT.service_error[lang](failedSvcs.join(', ')) };
    }
    return { level: 'warn', title: WARNING_TEXT.not_found[lang] };
  }

  if (word.confidence === 'no_meaning') {
    return { level: 'warn', title: WARNING_TEXT.no_meaning[lang] };
  }

  return null;
}

interface Props {
  word: WordAnalysis;
}

const UPOS_CLASSES: Record<string, string> = {
  NOUN:  'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200',
  VERB:  'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200',
  AUX:   'bg-red-50 text-red-700 border border-red-100 hover:bg-red-100',
  ADJ:   'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200',
  ADV:   'bg-orange-100 text-orange-800 border border-orange-200 hover:bg-orange-200',
  PRON:  'bg-purple-100 text-purple-800 border border-purple-200 hover:bg-purple-200',
  ADP:   'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200',
  CCONJ: 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200',
  SCONJ: 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200',
  PART:  'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200',
  DET:   'bg-teal-100 text-teal-800 border border-teal-200 hover:bg-teal-200',
  NUM:   'bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200',
  PROPN: 'bg-blue-200 text-blue-900 border border-blue-300 hover:bg-blue-300',
  INTJ:  'bg-pink-100 text-pink-800 border border-pink-200 hover:bg-pink-200',
};

const DEFAULT_CLASSES = 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100';

const TOOLTIP_WIDTH = 256;
const TOOLTIP_ESTIMATED_HEIGHT = 260;
const TOOLTIP_GAP = 8;

function calcStyle(el: HTMLElement): React.CSSProperties {
  const rect = el.getBoundingClientRect();
  let left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - TOOLTIP_WIDTH - 8));
  const spaceAbove = rect.top - TOOLTIP_GAP;
  if (spaceAbove >= TOOLTIP_ESTIMATED_HEIGHT) {
    return { top: rect.top - TOOLTIP_GAP, left, transform: 'translateY(-100%)' };
  }
  return { top: rect.bottom + TOOLTIP_GAP, left };
}

export function WordChip({ word }: Props) {
  const lang = useLang();
  const [hoverStyle, setHoverStyle] = useState<React.CSSProperties | null>(null);
  const [pinnedStyle, setPinnedStyle] = useState<React.CSSProperties | null>(null);
  const chipRef = useRef<HTMLSpanElement>(null);

  const showHover = useCallback(() => {
    if (!pinnedStyle && chipRef.current) setHoverStyle(calcStyle(chipRef.current));
  }, [pinnedStyle]);

  const hideHover = useCallback(() => setHoverStyle(null), []);

  const togglePin = useCallback(() => {
    if (pinnedStyle) {
      setPinnedStyle(null);
    } else if (chipRef.current) {
      setPinnedStyle(calcStyle(chipRef.current));
      setHoverStyle(null);
    }
  }, [pinnedStyle]);

  // Close pinned tooltip on Escape
  useEffect(() => {
    if (!pinnedStyle) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setPinnedStyle(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [pinnedStyle]);

  if (word.upos === 'PUNCT') {
    return (
      <span className="inline-flex flex-col items-center gap-0.5 -ml-1.5">
        <span className="text-gray-800 font-bold select-text text-sm py-0.5">{word.form}</span>
        <span className="h-[3.25rem] block" />
      </span>
    );
  }

  const colorClasses = UPOS_CLASSES[word.upos] ?? DEFAULT_CLASSES;
  const isPinned = !!pinnedStyle;
  const tooltipStyle = pinnedStyle ?? hoverStyle;
  const warning = getWarning(word, lang);

  return (
    <span className="inline-flex flex-col items-center gap-0.5">
      <span
        ref={chipRef}
        onMouseEnter={showHover}
        onMouseLeave={hideHover}
        onClick={togglePin}
        title={warning?.title}
        data-confidence={word.confidence}
        style={warning ? { outline: '2px solid #374151', outlineOffset: '2px' } : undefined}
        className={[
          'inline-block px-1.5 py-0.5 rounded text-sm font-medium select-text transition-colors',
          isPinned ? 'cursor-pointer ring-2 ring-offset-1 ring-gray-400' : 'cursor-pointer',
          colorClasses,
        ].join(' ')}
      >
        {word.form}
      </span>
      <span className="text-xs text-gray-500 leading-snug text-center w-24 mt-0.5 line-clamp-3 h-[3.25rem]">
        {word.meaning}
      </span>
      {tooltipStyle && createPortal(
        <WordTooltip word={word} style={tooltipStyle} pinned={isPinned} onClose={() => setPinnedStyle(null)} />,
        document.body
      )}
    </span>
  );
}
