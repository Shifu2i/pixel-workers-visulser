#!/usr/bin/env node
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { WebSocketBroadcaster } from './broadcaster.js'
import { ChatHandler } from './chatHandler.js'
import { scanProjectsDir } from './fileWatcher.js'
import type { WatcherAgent } from './types.js'

const WS_PORT = parseInt(process.env.WS_PORT ?? '7421', 10)
const SCAN_INTERVAL_MS = 3000

const projectsDir = process.env.CLAUDE_PROJECTS_DIR ?? path.join(os.homedir(), '.claude', 'projects')
const agents = new Map<string, WatcherAgent>()

console.log('[PixelDev] Starting PixelDev watcher...')
console.log(`[PixelDev] Watching: ${projectsDir}`)

// Start chat handler and WebSocket broadcaster
const chatHandler = new ChatHandler()
const broadcaster = new WebSocketBroadcaster(WS_PORT, chatHandler)

// Initial scan
scanProjectsDir(projectsDir, agents, broadcaster)

// Watch for new project directories / JSONL files
const scanInterval = setInterval(() => {
  scanProjectsDir(projectsDir, agents, broadcaster)
}, SCAN_INTERVAL_MS)

// Also watch the projects directory itself with fs.watch for fast detection
if (fs.existsSync(projectsDir)) {
  try {
    fs.watch(projectsDir, { recursive: true }, (eventType, filename) => {
      if (filename?.endsWith('.jsonl')) {
        scanProjectsDir(projectsDir, agents, broadcaster)
      }
    })
  } catch {
    // Recursive watch may not be supported on all platforms — polling covers it
  }
}

// Cleanup agents that have been inactive for > 10 minutes (stale sessions)
const cleanupInterval = setInterval(() => {
  const now = Date.now()
  for (const [id, agent] of agents) {
    if (now - agent.lastActivity > 10 * 60 * 1000) {
      agents.delete(id)
      console.log(`[PixelDev] Removed stale agent: ${id}`)
    }
  }
}, 60_000)

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[PixelDev] Shutting down...')
  clearInterval(scanInterval)
  clearInterval(cleanupInterval)
  chatHandler.cleanup()
  process.exit(0)
})

process.on('SIGTERM', () => {
  clearInterval(scanInterval)
  clearInterval(cleanupInterval)
  chatHandler.cleanup()
  process.exit(0)
})

console.log(`[PixelDev] WebSocket server ready on ws://localhost:${WS_PORT}`)
console.log('[PixelDev] Open http://localhost:7422 in your browser to view the overlay')
