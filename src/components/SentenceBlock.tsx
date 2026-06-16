import type { SentenceChunk } from '../types';
import { WordChip } from './WordChip';

interface Props {
  sentence: SentenceChunk;
}

export function SentenceBlock({ sentence }: Props) {
  return (
    <div className="mb-8">
      <div className="text-[10px] text-gray-400 mb-2 font-mono select-none">
        #{sentence.sentence_number}
      </div>
      {sentence.lines.map((line, li) => (
        <div key={line.line_number ?? li} className="flex flex-wrap items-end gap-x-2 gap-y-3 mb-3">
          {line.words.map((word, wi) => (
            <WordChip key={wi} word={word} />
          ))}
          {li < sentence.lines.length - 1 && (
            <span className="text-gray-300 text-xs self-start mt-1 select-none">·</span>
          )}
        </div>
      ))}
    </div>
  );
}
