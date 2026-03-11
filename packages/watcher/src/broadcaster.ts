import { WebSocket, WebSocketServer } from 'ws'
import type { AgentEvent } from './types.js'

export class WebSocketBroadcaster {
  private wss: WebSocketServer
  private clients = new Set<WebSocket>()

  constructor(port: number) {
    this.wss = new WebSocketServer({ port })
    this.wss.on('connection', (ws) => {
      this.clients.add(ws)
      console.log(`[PixelDev] Browser connected (${this.clients.size} clients)`)
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
}
