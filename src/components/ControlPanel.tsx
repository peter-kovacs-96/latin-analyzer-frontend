import { useState } from 'react';
import type { RecentFile, Lang, Mode } from '../types';
import { FileUpload } from './FileUpload';
import { RecentFiles } from './RecentFiles';

interface Props {
  open: boolean;
  onToggle: () => void;
  lang: Lang;
  onLangChange: (l: Lang) => void;
  mode: Mode;
  onModeChange: (m: Mode) => void;
  recentFiles: RecentFile[];
  onFile: (name: string, content: string) => void;
  onRecentSelect: (f: RecentFile) => void;
  isStreaming: boolean;
  debugMode: boolean;
  onDebugModeChange: (v: boolean) => void;
}

function InfoTooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full border border-gray-300 text-gray-400 text-[9px] font-bold cursor-default select-none leading-none">
        ?
      </span>
      {visible && (
        <span className="absolute left-5 top-1/2 -translate-y-1/2 z-50 w-44 rounded-md border border-gray-200 bg-white shadow-lg px-2.5 py-2 text-[11px] text-gray-600 leading-snug pointer-events-none">
          {text}
        </span>
      )}
    </span>
  );
}

function Toggle<T extends string>({
  label,
  hint,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  hint: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </p>
        <InfoTooltip text={hint} />
      </div>
      <div className="flex rounded-md overflow-hidden border border-gray-200">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => !disabled && onChange(opt)}
            disabled={disabled}
            className={[
              'flex-1 py-1 text-xs font-medium transition-colors',
              value === opt
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50',
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ControlPanel({
  open,
  onToggle,
  lang,
  onLangChange,
  mode,
  onModeChange,
  recentFiles,
  onFile,
  onRecentSelect,
  isStreaming,
  debugMode,
  onDebugModeChange,
}: Props) {
  return (
    <>
      <button
        onClick={onToggle}
        className="absolute top-3 left-3 z-30 flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors"
        title={open ? 'Close panel' : 'Open panel'}
      >
        {open ? (
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      <aside
        className={[
          'absolute top-0 left-0 z-20 h-full w-64 border-r border-gray-200 bg-white shadow-md flex flex-col transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center gap-2 px-4 pt-3 pb-3 border-b border-gray-100">
          <div className="w-8" />
          <h1 className="text-sm font-semibold text-gray-800 tracking-tight">Latin Analyzer</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          <FileUpload onFile={onFile} disabled={isStreaming} />

          <Toggle
            label="Language"
            hint="Az elemzés eredményeit (esetragok, mondatrészek stb.) milyen nyelven jelenítse meg."
            options={['hu', 'en'] as Lang[]}
            value={lang}
            onChange={onLangChange}
            disabled={isStreaming}
          />

          <Toggle
            label="Mode"
            hint="Sentence: mondatvégi írásjel (.!?) vagy üres sor választja el az egységeket. Stanza: csak üres sor."
            options={['sentence', 'stanza'] as Mode[]}
            value={mode}
            onChange={onModeChange}
            disabled={isStreaming}
          />

          <RecentFiles
            files={recentFiles}
            onSelect={onRecentSelect}
            disabled={isStreaming}
          />
        </div>

        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Debug mode</span>
            <button
              onClick={() => onDebugModeChange(!debugMode)}
              className={[
                'relative inline-flex h-4 w-7 items-center rounded-full transition-colors',
                debugMode ? 'bg-gray-700' : 'bg-gray-200',
              ].join(' ')}
              aria-label="Toggle debug mode"
            >
              <span className={[
                'inline-block h-3 w-3 transform rounded-full bg-white transition-transform',
                debugMode ? 'translate-x-3.5' : 'translate-x-0.5',
              ].join(' ')} />
            </button>
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="absolute inset-0 z-10 bg-black/10 sm:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}
