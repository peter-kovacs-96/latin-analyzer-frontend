# Latin Analyzer — Frontend

React + TypeScript frontend that streams Latin morphological analysis from the backend and renders results word-by-word in real time.

## Features

### Input
- File upload (`.txt` and `.docx`) or drag-and-drop
- `.docx` files are converted client-side using [mammoth.js](https://github.com/mwilliamson/mammoth.js) — no file is ever sent to a server
- Recent files panel: stores the last 5 uploaded files in `localStorage` and allows re-running any of them without re-uploading

### Streaming
- Consumes NDJSON from the backend via `fetch` + `ReadableStream`
- Results render sentence-by-sentence as they arrive, without waiting for the full response

### Display
- Color-coded word chips by UPOS tag:

  | UPOS | Color |
  |---|---|
  | NOUN | blue |
  | VERB | red |
  | ADJ | green |
  | ADV | orange |
  | PRON | purple |
  | PREP / CONJ / PART | gray |
  | PUNCT | no chip |

- Interlinear meaning displayed below each word chip

### Tooltip
- Hover over any word chip to see full detail
- Click to pin the tooltip open; close with the X button or Escape
- Shows: surface form, lemma, dictionary form (principal parts), meaning, full morphology table, syntactic role, confidence badge, and a link to the Latin is Simple entry

### Controls (collapsible left panel)
- Language toggle: `hu` / `en`
- Mode toggle: `sentence` / `stanza`
- File upload and recent files list

### Other
- "Powered by" bar: UDPipe (with full institution name on hover), Latin WordNet, Latin is Simple
- Keepalive ping to `/health` every 10 minutes to prevent the Render free-tier backend from sleeping

## Configuration

| Variable | Description | Default |
|---|---|---|
| `VITE_BACKEND_URL` | URL of the backend service | `http://localhost:8000` |

Set in `.env.local` for local development.

## Local development

```bash
npm install
npm run dev
```

## Stack

- React + TypeScript
- Vite
- Tailwind CSS v4

## Deployment

Hosted on **Render** (Static Site, free tier).
GitHub Actions triggers a deploy on every push to `main`.
