import { useMemo, useState, useCallback } from 'react'
import { useAgents } from './hooks/useAgents'
import { OfficeCanvas } from './office/components/OfficeCanvas'
import { StatusBar } from './office/components/StatusBar'
import { ActivityTicker } from './office/components/ActivityTicker'
import { Footer } from './office/components/Footer'
import { ChatModal } from './office/components/ChatModal'
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
  const { agents, activity, connected, sessionStart, chatMessages, streamingAgents, sendChat } = useAgents()
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  // Determine dominant glow from active agents
  const glowColor = useMemo(() => {
    for (const agent of agents.values()) {
      const color = STATE_GLOW[agent.state]
      if (color) return color
    }
    return ''
  }, [agents])

  const handleAgentClick = useCallback((agentId: string) => {
    setSelectedAgent(agentId)
  }, [])

  const handleCloseChat = useCallback(() => {
    setSelectedAgent(null)
  }, [])

  const selectedAgentInfo = selectedAgent ? agents.get(selectedAgent) : null

  return (
    <div className="pixeldev-root">
      <StatusBar
        connected={connected}
        agentCount={agents.size}
        sessionStart={sessionStart}
      />
      <OfficeCanvas
        agents={agents}
        glowColor={glowColor}
        onAgentClick={handleAgentClick}
      />
      <ActivityTicker activity={activity} />
      <Footer />

      {selectedAgent && selectedAgentInfo && (
        <ChatModal
          agentId={selectedAgent}
          agentLabel={selectedAgentInfo.label}
          agentState={selectedAgentInfo.state}
          onClose={handleCloseChat}
          sendChat={sendChat}
          messages={chatMessages.get(selectedAgent) ?? []}
          streaming={streamingAgents.has(selectedAgent)}
        />
      )}
    </div>
  )
}
