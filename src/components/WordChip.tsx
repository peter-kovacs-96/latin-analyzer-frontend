import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { WordAnalysis } from '../types';
import { WordTooltip } from './WordTooltip';
import { useDebug } from '../DebugContext';

const ERROR_STATUSES = new Set([
  'timeout', 'network_error', 'http_error', 'rate_limited',
  'invalid_response', 'unavailable', 'unknown_error',
]);

interface Warning {
  level: 'error' | 'warn';
  title: string;
}

function getWarning(word: WordAnalysis): Warning | null {
  if (word.confidence === 'full') return null;

  const ds = word.downstreams ?? {};
  const failedSvcs = Object.entries(ds)
    .filter(([, d]) => ERROR_STATUSES.has(d.status))
    .map(([svc]) => svc);

  if (word.confidence === 'form_only') {
    if (failedSvcs.length > 0) {
      return { level: 'error', title: `Service error (${failedSvcs.join(', ')}) — morphology unconfirmed` };
    }
    return { level: 'warn', title: 'Word not found in any dictionary' };
  }

  if (word.confidence === 'no_meaning') {
    return { level: 'warn', title: 'No translation found (Latin is Simple)' };
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
    return <span className="text-gray-400 select-text mt-1">{word.form}</span>;
  }

  const debug = useDebug();
  const colorClasses = UPOS_CLASSES[word.upos] ?? DEFAULT_CLASSES;
  const isPinned = !!pinnedStyle;
  const tooltipStyle = pinnedStyle ?? hoverStyle;
  const warning = debug ? getWarning(word) : null;

  return (
    <span className="inline-flex flex-col items-center gap-0.5">
      <span className="relative">
        <span
          ref={chipRef}
          onMouseEnter={showHover}
          onMouseLeave={hideHover}
          onClick={togglePin}
          className={[
            'inline-block px-1.5 py-0.5 rounded text-sm font-medium select-text transition-colors',
            isPinned ? 'cursor-pointer ring-2 ring-offset-1 ring-gray-400' : 'cursor-pointer',
            colorClasses,
          ].join(' ')}
        >
          {word.form}
        </span>
        {warning && (
          <span
            title={warning.title}
            className={[
              'absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full',
              'flex items-center justify-center text-[9px] font-bold leading-none',
              'select-none cursor-help',
              warning.level === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-amber-400 text-white',
            ].join(' ')}
          >
            !
          </span>
        )}
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
