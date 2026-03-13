import { WebSocket, WebSocketServer } from 'ws'
import type { AgentEvent, ChatRequest } from './types.js'
import type { ChatHandler } from './chatHandler.js'

export class WebSocketBroadcaster {
  private wss: WebSocketServer
  private clients = new Set<WebSocket>()
  private chatHandler: ChatHandler | null

  constructor(port: number, chatHandler?: ChatHandler) {
    this.chatHandler = chatHandler ?? null
    this.wss = new WebSocketServer({ port })
    this.wss.on('connection', (ws) => {
      this.clients.add(ws)
      console.log(`[PixelDev] Browser connected (${this.clients.size} clients)`)
      ws.on('message', (data) => {
        this.handleIncomingMessage(ws, data)
      })
      ws.on('close', () => {
        this.clients.delete(ws)
        console.log(`[PixelDev] Browser disconnected (${this.clients.size} clients)`)
      })
      ws.on('error', (err) => {
        console.error(`[PixelDev] WebSocket error: ${err.message}`)
        this.clients.delete(ws)
      })
    })
    this.wss.on('listening', () => {
      console.log(`[PixelDev] WebSocket server listening on ws://localhost:${port}`)
    })
    this.wss.on('error', (err) => {
      console.error(`[PixelDev] WebSocket server error: ${err.message}`)
    })
  }

  emit(event: AgentEvent): void {
    const payload = JSON.stringify(event)
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload)
      }
    }
  }

  clientCount(): number {
    return this.clients.size
  }

  private handleIncomingMessage(ws: WebSocket, data: unknown): void {
    let msg: Record<string, unknown>
    try {
      msg = JSON.parse(typeof data === 'string' ? data : String(data))
    } catch {
      console.warn('[PixelDev] Received non-JSON message from client')
      return
    }

    if (msg.type === 'chat') {
      const { agentId, prompt } = msg as unknown as ChatRequest
      if (!agentId || !prompt) {
        console.warn('[PixelDev] Invalid chat request: missing agentId or prompt')
        return
      }
      if (!this.chatHandler) {
        console.warn('[PixelDev] Chat request received but no ChatHandler configured')
        return
      }
      const sendBack = (response: Record<string, unknown>) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(response))
        }
      }
      this.chatHandler.handleChat(agentId, prompt, sendBack)
    }
  }
}
