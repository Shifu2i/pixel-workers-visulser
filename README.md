# PixelDev

> Watch your Claude Code agents come to life as pixel-art characters

PixelDev is a real-time browser visualization that turns Claude Code agent activity into an animated pixel-art office. Each agent appears as a unique character, switching animations based on what tool it's currently using — typing at a desk when writing code, reading a file, running tests, or committing to git.

---

<!-- Add a screenshot or GIF here -->
<!-- ![PixelDev Demo](./docs/demo.gif) -->

---

## What It Does

PixelDev watches `~/.claude/projects/` for Claude Code transcript files (`.jsonl`) and parses tool invocations in real time. Each agent maps to a character in a shared pixel-art office with up to 6 seats.

**Agent states and visual indicators:**

| State | Trigger | Glow Color |
|-------|---------|------------|
| `writing` | Write / Edit tools | Blue |
| `reading` | Read / Grep / Glob / WebFetch / WebSearch | Cyan |
| `testing` | Bash — test commands | Green |
| `committing` | Bash — git commands | Amber |
| `thinking` | Planning / idle / subagent tasks | None |
| `erroring` | Error detected in output | Red |

---

## Architecture

```
Claude Code writes JSONL
         ↓
~/.claude/projects/<project-hash>/<session>.jsonl
         ↓
packages/watcher  (Node.js)
  fs.watch + polling
  transcriptParser → AgentEvent
  WebSocket broadcast on port 7421
         ↓  ws://localhost:7421
packages/overlay  (React + Vite)
  useAgents hook receives events
  Canvas renders animated pixel-art office
  http://localhost:7422
```

---

## Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9 — `npm install -g pnpm`
- **Claude Code** installed and running at least one project session

---

## Installation

```bash
git clone <repo-url>
cd pixel-workers-visulser
pnpm install
pnpm -r build
```

---

## Usage

Start both services (two terminals):

```bash
# Terminal 1 — start the file watcher + WebSocket server
pnpm --filter pixeldev-watcher start

# Terminal 2 — start the browser overlay
pnpm --filter pixeldev-overlay dev
```

Then open **http://localhost:7422** in your browser.

Start (or resume) any Claude Code session in a project directory — the agent's character will appear automatically and animate based on what it's doing.

---

## Development

```bash
# Watcher in watch mode (tsx, no build step needed)
pnpm --filter pixeldev-watcher dev

# Overlay with Vite HMR
pnpm --filter pixeldev-overlay dev
```

---

## Project Structure

```
pixel-workers-visulser/
├── package.json              # pnpm workspace root
├── pnpm-workspace.yaml
└── packages/
    ├── watcher/              # Node.js backend
    │   └── src/
    │       ├── index.ts          # Entry: scan ~/.claude/projects/, start WS server
    │       ├── broadcaster.ts    # WebSocket server (port 7421)
    │       ├── fileWatcher.ts    # fs.watch + polling on JSONL files
    │       ├── transcriptParser.ts # Maps tool use → AgentState
    │       └── types.ts
    └── overlay/              # React + Vite frontend
        └── src/
            ├── App.tsx
            ├── hooks/
            │   └── useAgents.ts      # WebSocket client + agent state
            └── office/
                ├── engine/
                │   ├── gameLoop.ts       # rAF loop
                │   ├── officeState.ts    # Layout, furniture, characters
                │   ├── characters.ts     # Character FSM (IDLE/WALK/TYPE/READ)
                │   └── renderer.ts       # Canvas drawing
                ├── sprites/
                │   ├── spriteData.ts     # Pixel art sprite definitions
                │   └── spriteCache.ts    # Offscreen canvas caching
                └── components/
                    ├── OfficeCanvas.tsx
                    ├── StatusBar.tsx
                    ├── ActivityTicker.tsx
                    └── Footer.tsx
```

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, HTML5 Canvas
- **Backend**: Node.js, TypeScript, `ws` (WebSockets)
- **Monorepo**: pnpm workspaces
- **Fonts**: Press Start 2P, Share Tech Mono

---

## License

MIT
