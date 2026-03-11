import { useCallback, useEffect, useRef, useState } from 'react'
import type { AgentEvent, AgentInfo } from '../types'
import { inferLabel } from '../types'

const WS_URL = 'ws://localhost:7421'
const MAX_AGENTS = 6
const AGENT_IDLE_TIMEOUT_MS = 30_000
const RECONNECT_DELAY_MS = 2000

export interface AgentsState {
  agents: Map<string, AgentInfo>
  activity: string[]
  connected: boolean
  sessionStart: number | null
}

export function useAgents(): AgentsState {
  const [agents, setAgents] = useState<Map<string, AgentInfo>>(new Map())
  const [activity, setActivity] = useState<string[]>([])
  const [connected, setConnected] = useState(false)
  const [sessionStart, setSessionStart] = useState<number | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isUnmountedRef = useRef(false)
  const seatCounterRef = useRef(0)
  const agentSeatMapRef = useRef<Map<string, number>>(new Map())

  const connect = useCallback(() => {
    if (isUnmountedRef.current) return
    if (wsRef.current?.readyState === WebSocket.CONNECTING) return

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      if (isUnmountedRef.current) return
      setConnected(true)
      console.log('[PixelDev] WebSocket connected')
    }

    ws.onmessage = ({ data }: MessageEvent<string>) => {
      if (isUnmountedRef.current) return

      let event: AgentEvent
      try {
        event = JSON.parse(data) as AgentEvent
      } catch {
        return
      }

      // Record session start on first event
      setSessionStart((prev) => prev ?? Date.now())

      setAgents((prev) => {
        const next = new Map(prev)

        let info = next.get(event.agentId)
        if (!info) {
          // Assign a seat index
          let seatIndex = agentSeatMapRef.current.get(event.agentId)
          if (seatIndex === undefined) {
            seatIndex = seatCounterRef.current % MAX_AGENTS
            seatCounterRef.current++
            agentSeatMapRef.current.set(event.agentId, seatIndex)
          }
          info = {
            agentId: event.agentId,
            label: event.agentLabel ?? 'AGENT',
            state: event.state,
            seatIndex,
            lastActivity: Date.now(),
            stateHistory: [],
          }
        }

        const updated: AgentInfo = {
          ...info,
          state: event.state,
          lastActivity: Date.now(),
          stateHistory: [...info.stateHistory, event.state].slice(-20),
        }

        // Update label from inferred dominant state (after accumulating history)
        if (!event.agentLabel) {
          updated.label = inferLabel(updated.stateHistory)
        } else {
          updated.label = event.agentLabel
        }

        next.set(event.agentId, updated)
        return next
      })

      // Update activity log
      if (event.detail) {
        setAgents((prev) => {
          const info = prev.get(event.agentId)
          const label = info?.label ?? event.agentId
          const line = `${label.toLowerCase()}: ${event.detail}`
          setActivity((prevActivity) => [line, ...prevActivity].slice(0, 5))
          return prev
        })
      }
    }

    ws.onclose = () => {
      if (isUnmountedRef.current) return
      setConnected(false)
      wsRef.current = null
      console.log('[PixelDev] WebSocket disconnected, reconnecting...')
      reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS)
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [])

  // Cleanup idle agents
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now()
      setAgents((prev) => {
        let changed = false
        const next = new Map(prev)
        for (const [id, agent] of next) {
          if (now - agent.lastActivity > AGENT_IDLE_TIMEOUT_MS) {
            next.delete(id)
            agentSeatMapRef.current.delete(id)
            changed = true
          }
        }
        return changed ? next : prev
      })
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    isUnmountedRef.current = false
    connect()
    return () => {
      isUnmountedRef.current = true
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  return { agents, activity, connected, sessionStart }
}
