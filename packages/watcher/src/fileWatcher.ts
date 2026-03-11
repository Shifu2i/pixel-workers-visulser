import * as fs from 'fs'
import * as path from 'path'
import type { WatcherAgent } from './types.js'
import type { WebSocketBroadcaster } from './broadcaster.js'
import { processTranscriptLine } from './transcriptParser.js'

const POLL_INTERVAL_MS = 2000

export function startFileWatching(
  agent: WatcherAgent,
  agents: Map<string, WatcherAgent>,
  broadcaster: WebSocketBroadcaster,
): void {
  // Primary: fs.watch (may miss events on macOS)
  try {
    const watcher = fs.watch(agent.jsonlFile, () => {
      readNewLines(agent, broadcaster)
    })
    watcher.on('error', () => {
      // Ignore — polling will cover it
    })
  } catch {
    // fs.watch may fail — polling will cover it
  }

  // Backup: polling every 2s
  const timer = setInterval(() => {
    if (!agents.has(agent.id)) {
      clearInterval(timer)
      return
    }
    readNewLines(agent, broadcaster)
  }, POLL_INTERVAL_MS)
}

export function readNewLines(
  agent: WatcherAgent,
  broadcaster: WebSocketBroadcaster,
): void {
  try {
    const stat = fs.statSync(agent.jsonlFile)
    if (stat.size <= agent.fileOffset) return

    const buf = Buffer.alloc(stat.size - agent.fileOffset)
    const fd = fs.openSync(agent.jsonlFile, 'r')
    fs.readSync(fd, buf, 0, buf.length, agent.fileOffset)
    fs.closeSync(fd)
    agent.fileOffset = stat.size

    const text = agent.lineBuffer + buf.toString('utf-8')
    const lines = text.split('\n')
    agent.lineBuffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.trim()) continue
      processTranscriptLine(agent, line, broadcaster)
    }
  } catch {
    // File may not exist yet or be unreadable — ignore
  }
}

export function scanProjectsDir(
  projectsDir: string,
  agents: Map<string, WatcherAgent>,
  broadcaster: WebSocketBroadcaster,
): void {
  if (!fs.existsSync(projectsDir)) return

  try {
    const projectDirs = fs.readdirSync(projectsDir)
    for (const projectHash of projectDirs) {
      const projectPath = path.join(projectsDir, projectHash)
      try {
        const stat = fs.statSync(projectPath)
        if (!stat.isDirectory()) continue
      } catch {
        continue
      }

      try {
        const files = fs.readdirSync(projectPath)
        for (const file of files) {
          if (!file.endsWith('.jsonl')) continue
          const jsonlPath = path.join(projectPath, file)
          const agentId = `${projectHash}/${file.replace('.jsonl', '')}`

          if (agents.has(agentId)) continue

          // New JSONL file discovered — start watching it
          try {
            const fileStat = fs.statSync(jsonlPath)
            const agent: WatcherAgent = {
              id: agentId,
              projectDir: projectPath,
              jsonlFile: jsonlPath,
              // Start at end of existing file to only process new lines
              fileOffset: fileStat.size,
              lineBuffer: '',
              currentState: 'thinking',
              activeToolIds: new Set(),
              activeToolNames: new Map(),
              lastActivity: Date.now(),
            }
            agents.set(agentId, agent)
            console.log(`[PixelDev] Watching agent: ${agentId}`)
            startFileWatching(agent, agents, broadcaster)
          } catch {
            // Skip files we can't stat
          }
        }
      } catch {
        // Skip dirs we can't read
      }
    }
  } catch {
    // Projects dir may not exist yet
  }
}
