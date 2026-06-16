import type { SentenceChunk } from '../types';
import { WordChip } from './WordChip';

interface Props {
  sentence: SentenceChunk;
}

export function SentenceBlock({ sentence }: Props) {
  return (
    <div className="mb-6">
      <div className="text-[10px] text-gray-400 mb-1 font-mono select-none">
        #{sentence.sentence_number}
      </div>
      <div className="leading-loose">
        {sentence.lines.map((line, li) => (
          <span key={line.line_number ?? li}>
            {line.words.map((word, wi) => {
              const needsSpace =
                wi > 0 &&
                word.upos !== 'PUNCT' &&
                ![')', ']', '}'].includes(word.form);
              return (
                <span key={wi}>
                  {needsSpace && ' '}
                  <WordChip word={word} />
                </span>
              );
            })}
            {li < sentence.lines.length - 1 && (
              <span className="text-gray-300 mx-1 select-none">·</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
