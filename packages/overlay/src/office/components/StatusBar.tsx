import { useEffect, useState } from 'react'

interface Props {
  connected: boolean
  agentCount: number
  sessionStart: number | null
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function StatusBar({ connected, agentCount, sessionStart }: Props) {
  const [elapsed, setElapsed] = useState('00:00:00')

  useEffect(() => {
    if (!sessionStart) return
    const timer = setInterval(() => {
      setElapsed(formatElapsed(Date.now() - sessionStart))
    }, 1000)
    return () => clearInterval(timer)
  }, [sessionStart])

  return (
    <div className="status-bar">
      <span className="brand">◉ PIXELDEV</span>
      <span className={`live-indicator ${connected ? 'live' : 'disconnected'}`}>
        ● {connected ? 'LIVE' : 'DISCONNECTED'}
      </span>
      <span className="meta">{agentCount} agent{agentCount !== 1 ? 's' : ''} active</span>
      <span className="meta timer">{sessionStart ? elapsed : '--:--:--'}</span>
    </div>
  )
}
