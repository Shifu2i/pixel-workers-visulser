export type AgentState =
  | 'writing'
  | 'reading'
  | 'testing'
  | 'committing'
  | 'thinking'
  | 'erroring'

export interface AgentEvent {
  agentId: string
  agentLabel?: string
  state: AgentState
  tool: string
  detail?: string
  timestamp: number
}

export interface WatcherAgent {
  id: string
  projectDir: string
  jsonlFile: string
  fileOffset: number
  lineBuffer: string
  currentState: AgentState
  activeToolIds: Set<string>
  activeToolNames: Map<string, string>
  lastActivity: number
}

export interface ChatRequest {
  type: 'chat'
  agentId: string
  prompt: string
}

export interface ChatResponse {
  type: 'chat-response'
  agentId: string
  text: string
  done: boolean
}
