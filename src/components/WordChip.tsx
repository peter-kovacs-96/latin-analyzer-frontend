import { useState } from 'react';
import type { WordAnalysis } from '../types';
import { WordTooltip } from './WordTooltip';

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

export function WordChip({ word }: Props) {
  const [hovered, setHovered] = useState(false);

  if (word.upos === 'PUNCT') {
    return <span className="text-gray-400 select-text">{word.form}</span>;
  }

  const colorClasses = UPOS_CLASSES[word.upos] ?? DEFAULT_CLASSES;

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className={`inline-block px-1.5 py-0.5 rounded text-sm font-medium cursor-default select-text transition-colors ${colorClasses}`}>
        {word.form}
      </span>
      {hovered && <WordTooltip word={word} />}
    </span>
  );
}
