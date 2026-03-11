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

export interface AgentInfo {
  agentId: string
  label: string
  state: AgentState
  seatIndex: number
  lastActivity: number
  stateHistory: AgentState[]
}

export const STATE_LABEL_MAP: Record<AgentState, string> = {
  writing: 'CODER',
  testing: 'TESTER',
  reading: 'READER',
  committing: 'DEPLOYER',
  thinking: 'PLANNER',
  erroring: 'DEBUGGER',
}

export function inferLabel(history: AgentState[]): string {
  if (history.length === 0) return 'AGENT'
  const counts: Partial<Record<AgentState, number>> = {}
  for (const s of history) {
    counts[s] = (counts[s] ?? 0) + 1
  }
  const dominant = (Object.entries(counts) as [AgentState, number][]).sort(
    (a, b) => b[1] - a[1],
  )[0][0]
  return STATE_LABEL_MAP[dominant] ?? 'AGENT'
}
