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
}

function Toggle<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
        {label}
      </p>
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
}: Props) {
  return (
    <>
      {/* Toggle button — always visible */}
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

      {/* Sliding panel */}
      <aside
        className={[
          'absolute top-0 left-0 z-20 h-full w-64 border-r border-gray-200 bg-white shadow-md flex flex-col transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Panel header */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-3 border-b border-gray-100">
          <div className="w-8" /> {/* spacer for toggle button */}
          <h1 className="text-sm font-semibold text-gray-800 tracking-tight">Latin Analyzer</h1>
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          <FileUpload onFile={onFile} disabled={isStreaming} />

          <Toggle
            label="Language"
            options={['hu', 'en'] as Lang[]}
            value={lang}
            onChange={onLangChange}
            disabled={isStreaming}
          />

          <Toggle
            label="Mode"
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

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 text-center">
            Hover words for morphology
          </p>
        </div>
      </aside>

      {/* Overlay (mobile / narrow) */}
      {open && (
        <div
          className="absolute inset-0 z-10 bg-black/10 sm:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}
