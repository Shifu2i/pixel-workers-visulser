import { useMemo } from 'react'
import { useAgents } from './hooks/useAgents'
import { OfficeCanvas } from './office/components/OfficeCanvas'
import { StatusBar } from './office/components/StatusBar'
import { ActivityTicker } from './office/components/ActivityTicker'
import { Footer } from './office/components/Footer'
import type { AgentState } from './types'

const STATE_GLOW: Record<AgentState, string> = {
  writing: '#1A1AFF',
  reading: '#00FFCC',
  testing: '#00CC66',
  committing: '#FFB347',
  thinking: '',
  erroring: '#FF3333',
}

export function App() {
  const { agents, activity, connected, sessionStart } = useAgents()

  // Determine dominant glow from active agents
  const glowColor = useMemo(() => {
    for (const agent of agents.values()) {
      const color = STATE_GLOW[agent.state]
      if (color) return color
    }
    return ''
  }, [agents])

  return (
    <div className="pixeldev-root">
      <StatusBar
        connected={connected}
        agentCount={agents.size}
        sessionStart={sessionStart}
      />
      <OfficeCanvas agents={agents} glowColor={glowColor} />
      <ActivityTicker activity={activity} />
      <Footer />
    </div>
  )
}
