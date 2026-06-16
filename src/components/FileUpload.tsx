import { useRef, useState } from "react";
import type { DragEvent, ChangeEvent } from "react";

interface Props {
  onFile: (name: string, content: string) => void;
  disabled: boolean;
}

export function FileUpload({ onFile, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function processFile(file: File) {
    setError(null);
    try {
      if (file.name.endsWith('.docx')) {
        const mammoth = await import('mammoth');
        const buf = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: buf });
        onFile(file.name, result.value);
      } else {
        const text = await file.text();
        onFile(file.name, text);
      }
    } catch (e) {
      setError(`Failed to read file: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  }

  return (
    <div>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={[
          'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors select-none',
          dragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ].join(' ')}
      >
        <svg className="w-6 h-6 mx-auto mb-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-xs text-gray-500">
          {disabled ? 'Analyzing…' : 'Drop file or click'}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">.txt · .docx</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.docx"
        className="hidden"
        onChange={onChange}
        disabled={disabled}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
