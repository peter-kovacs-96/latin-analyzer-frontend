import type { RecentFile } from '../types';

interface Props {
  files: RecentFile[];
  onSelect: (file: RecentFile) => void;
  disabled: boolean;
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function RecentFiles({ files, onSelect, disabled }: Props) {
  if (files.length === 0) return null;

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
        Recent
      </p>
      <ul className="space-y-1">
        {files.map(f => (
          <li key={f.timestamp}>
            <button
              onClick={() => !disabled && onSelect(f)}
              disabled={disabled}
              className="w-full text-left rounded px-2 py-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors group"
            >
              <p className="text-xs text-gray-700 truncate group-hover:text-gray-900">{f.name}</p>
              <p className="text-[10px] text-gray-400">{relativeTime(f.timestamp)}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
