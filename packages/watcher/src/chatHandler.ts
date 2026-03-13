import { spawn, type ChildProcess } from 'child_process'

type SendBack = (msg: { type: 'chat-response'; agentId: string; text: string; done: boolean }) => void

export class ChatHandler {
  private activeProcesses = new Map<string, ChildProcess>()

  handleChat(agentId: string, prompt: string, sendBack: SendBack): void {
    // Kill any existing process for this agent
    const existing = this.activeProcesses.get(agentId)
    if (existing) {
      existing.kill('SIGTERM')
      this.activeProcesses.delete(agentId)
    }

    const cwd = process.cwd()

    let proc: ChildProcess
    try {
      proc = spawn('claude', ['--print', '--output-format', 'stream-json', prompt], {
        cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[PixelDev] Failed to spawn claude for agent ${agentId}: ${message}`)
      sendBack({ type: 'chat-response', agentId, text: `Error: ${message}`, done: false })
      sendBack({ type: 'chat-response', agentId, text: '', done: true })
      return
    }

    this.activeProcesses.set(agentId, proc)

    let lineBuffer = ''

    proc.stdout?.on('data', (chunk: Buffer) => {
      lineBuffer += chunk.toString('utf-8')
      const lines = lineBuffer.split('\n')
      // Keep the last (possibly incomplete) line in the buffer
      lineBuffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue

        try {
          const parsed = JSON.parse(trimmed)
          const text = extractText(parsed)
          if (text) {
            sendBack({ type: 'chat-response', agentId, text, done: false })
          }
        } catch {
          // Not valid JSON — skip
        }
      }
    })

    proc.stderr?.on('data', (chunk: Buffer) => {
      console.error(`[PixelDev] claude stderr (agent ${agentId}): ${chunk.toString('utf-8').trim()}`)
    })

    proc.on('error', (err) => {
      console.error(`[PixelDev] claude process error (agent ${agentId}): ${err.message}`)
      this.activeProcesses.delete(agentId)
      sendBack({ type: 'chat-response', agentId, text: `Error: ${err.message}`, done: false })
      sendBack({ type: 'chat-response', agentId, text: '', done: true })
    })

    proc.on('exit', (code) => {
      this.activeProcesses.delete(agentId)

      // Flush any remaining data in the line buffer
      if (lineBuffer.trim()) {
        try {
          const parsed = JSON.parse(lineBuffer.trim())
          const text = extractText(parsed)
          if (text) {
            sendBack({ type: 'chat-response', agentId, text, done: false })
          }
        } catch {
          // ignore
        }
        lineBuffer = ''
      }

      if (code !== 0 && code !== null) {
        console.warn(`[PixelDev] claude exited with code ${code} for agent ${agentId}`)
      }

      sendBack({ type: 'chat-response', agentId, text: '', done: true })
    })
  }

  cleanup(): void {
    for (const [agentId, proc] of this.activeProcesses) {
      console.log(`[PixelDev] Killing claude process for agent ${agentId}`)
      proc.kill('SIGTERM')
    }
    this.activeProcesses.clear()
  }
}

/**
 * Extract text content from a stream-json event emitted by `claude --output-format stream-json`.
 * The shape varies, but text typically lives at:
 *   - event.content_block_delta.delta.text
 *   - event.result.text (on completion)
 *   - event.content[].text (message events)
 *   - or directly at event.text
 */
function extractText(obj: Record<string, unknown>): string {
  // content_block_delta style
  if (obj.type === 'content_block_delta') {
    const delta = obj.delta as Record<string, unknown> | undefined
    if (delta && typeof delta.text === 'string') {
      return delta.text
    }
  }

  // Direct text field
  if (typeof obj.text === 'string') {
    return obj.text
  }

  // result.text
  if (obj.result && typeof (obj.result as Record<string, unknown>).text === 'string') {
    return (obj.result as Record<string, unknown>).text as string
  }

  // content array with text blocks
  if (Array.isArray(obj.content)) {
    const texts: string[] = []
    for (const block of obj.content) {
      if (block && typeof block === 'object' && typeof block.text === 'string') {
        texts.push(block.text)
      }
    }
    if (texts.length > 0) return texts.join('')
  }

  return ''
}
