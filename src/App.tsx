import { useState, useEffect, useCallback } from 'react';
import type { SentenceChunk, StreamChunk, RecentFile, Lang, Mode } from './types';
import { ControlPanel } from './components/ControlPanel';
import { ResultsView } from './components/ResultsView';

const RECENT_KEY = 'latin_recent_files';
const MAX_RECENT = 5;

function loadRecentFiles(): RecentFile[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as RecentFile[];
  } catch {
    return [];
  }
}

function saveRecentFile(file: RecentFile, current: RecentFile[]): RecentFile[] {
  const filtered = current.filter(f => f.name !== file.name);
  const next = [file, ...filtered].slice(0, MAX_RECENT);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // localStorage full or unavailable
  }
  return next;
}

export default function App() {
  const [lang, setLang] = useState<Lang>('hu');
  const [mode, setMode] = useState<Mode>('sentence');
  const [sentences, setSentences] = useState<SentenceChunk[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [currentFileName, setCurrentFileName] = useState('');
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>(() => loadRecentFiles());

  // Close panel on narrow screens once analysis starts
  useEffect(() => {
    if (isStreaming && window.innerWidth < 640) {
      setPanelOpen(false);
    }
  }, [isStreaming]);

  // Keep backend warm: ping /health every 10 minutes when tab is visible
  useEffect(() => {
    const backendUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? 'http://localhost:8000';
    const ping = () => {
      if (document.visibilityState === 'visible') {
        fetch(`${backendUrl}/health`, { method: 'GET' }).catch(() => {});
      }
    };
    ping(); // immediate ping on mount
    const id = setInterval(ping, 10 * 60 * 1000);
    document.addEventListener('visibilitychange', ping);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', ping);
    };
  }, []);

  const analyze = useCallback(
    async (fileName: string, text: string) => {
      setSentences([]);
      setIsStreaming(true);
      setCurrentFileName(fileName);

      const backendUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? 'http://localhost:8000';

      try {
        const response = await fetch(
          `${backendUrl}/analyze/stream?lang=${lang}&mode=${mode}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            body: text,
          }
        );

        if (!response.ok || !response.body) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              const chunk = JSON.parse(trimmed) as StreamChunk;
              if ('sentence_number' in chunk) {
                setSentences(prev => [...prev, chunk]);
              }
              // empty lines are ignored (spacing handled by paragraph breaks)
            } catch {
              // skip malformed lines
            }
          }
        }

        // Process any remaining buffer content
        if (buffer.trim()) {
          try {
            const chunk = JSON.parse(buffer.trim()) as StreamChunk;
            if ('sentence_number' in chunk) {
              setSentences(prev => [...prev, chunk]);
            }
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.error('Analysis error:', err);
      } finally {
        setIsStreaming(false);
      }
    },
    [lang, mode]
  );

  function handleFile(name: string, content: string) {
    const entry: RecentFile = { name, content, timestamp: Date.now() };
    setRecentFiles(prev => saveRecentFile(entry, prev));
    analyze(name, content);
  }

  function handleRecentSelect(file: RecentFile) {
    // Bump timestamp to top
    setRecentFiles(prev => saveRecentFile({ ...file, timestamp: Date.now() }, prev));
    analyze(file.name, file.content);
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-50 flex">
      <ControlPanel
        open={panelOpen}
        onToggle={() => setPanelOpen(o => !o)}
        lang={lang}
        onLangChange={setLang}
        mode={mode}
        onModeChange={setMode}
        recentFiles={recentFiles}
        onFile={handleFile}
        onRecentSelect={handleRecentSelect}
        isStreaming={isStreaming}
      />

      {/* Main content area — shifts right when panel open (sm+) */}
      <main
        className={[
          'flex-1 h-full transition-[margin] duration-200',
          panelOpen ? 'sm:ml-64' : 'ml-0',
        ].join(' ')}
      >
        {/* Spacer for toggle button */}
        <div className="h-full pt-0">
          <div className="h-full flex flex-col">
            {/* Top bar */}
            <div className="flex items-center h-12 px-4 border-b border-gray-200 bg-white">
              <div className="w-10" /> {/* space for toggle button */}
              <span className="text-xs text-gray-400 ml-2">
                {isStreaming
                  ? 'Streaming…'
                  : sentences.length > 0
                  ? `${sentences.length} sentence${sentences.length !== 1 ? 's' : ''}`
                  : 'No results yet'}
              </span>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-hidden">
              <ResultsView
                sentences={sentences}
                isStreaming={isStreaming}
                fileName={currentFileName}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
