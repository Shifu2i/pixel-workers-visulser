import * as path from 'path'
import type { AgentEvent, AgentState, WatcherAgent } from './types.js'
import type { WebSocketBroadcaster } from './broadcaster.js'

const BASH_COMMAND_MAX_LENGTH = 60
const TASK_DESCRIPTION_MAX_LENGTH = 50

export const PERMISSION_EXEMPT_TOOLS = new Set(['Task', 'AskUserQuestion'])

/** Tools that show reading animation */
const READING_TOOLS = new Set([
  'Read',
  'Grep',
  'Glob',
  'WebFetch',
  'WebSearch',
  'LS',
])

export function mapToolToState(
  toolName: string,
  toolInput?: Record<string, unknown>,
): AgentState {
  if (toolName === 'Write' || toolName === 'Edit' || toolName === 'NotebookEdit') {
    return 'writing'
  }
  if (READING_TOOLS.has(toolName)) {
    return 'reading'
  }
  if (toolName === 'Bash') {
    const cmd = (toolInput?.command as string) ?? ''
    if (/vitest|jest|pytest|npm test|bun test|cargo test/.test(cmd)) return 'testing'
    if (/git push|git commit/.test(cmd)) return 'committing'
    return 'reading'
  }
  if (toolName === 'Task') return 'thinking'
  return 'thinking'
}

export function mapErrorToState(output: string): AgentState | null {
  if (/error|Error|FAIL|failed/i.test(output)) return 'erroring'
  return null
}

export function formatDetail(
  toolName: string,
  input: Record<string, unknown>,
): string | undefined {
  const base = (p: unknown): string =>
    typeof p === 'string' ? path.basename(p) : ''

  switch (toolName) {
    case 'Read':
      return base(input.file_path)
    case 'Edit':
    case 'Write':
    case 'NotebookEdit':
      return base(input.file_path)
    case 'Bash': {
      const cmd = (input.command as string) || ''
      return cmd.length > BASH_COMMAND_MAX_LENGTH
        ? cmd.slice(0, BASH_COMMAND_MAX_LENGTH) + '…'
        : cmd
    }
    case 'Glob':
      return typeof input.pattern === 'string' ? input.pattern : undefined
    case 'Grep':
      return typeof input.pattern === 'string' ? input.pattern : undefined
    case 'WebFetch':
    case 'WebSearch':
      return typeof input.query === 'string' ? input.query : undefined
    case 'Task': {
      const desc = typeof input.description === 'string' ? input.description : ''
      return desc
        ? desc.length > TASK_DESCRIPTION_MAX_LENGTH
          ? desc.slice(0, TASK_DESCRIPTION_MAX_LENGTH) + '…'
          : desc
        : undefined
    }
    default:
      return undefined
  }
}

export function processTranscriptLine(
  agent: WatcherAgent,
  line: string,
  broadcaster: WebSocketBroadcaster,
): void {
  let record: Record<string, unknown>
  try {
    record = JSON.parse(line)
  } catch {
    return
  }

  if (record.type === 'assistant' && Array.isArray((record.message as Record<string, unknown>)?.content)) {
    const content = (record.message as Record<string, unknown>).content as Array<Record<string, unknown>>
    const toolUseBlocks = content.filter((b) => b.type === 'tool_use')

    if (toolUseBlocks.length > 0) {
      agent.lastActivity = Date.now()

      for (const block of toolUseBlocks) {
        const toolName = (block.name as string) || ''
        const toolId = (block.id as string) || ''
        const toolInput = (block.input as Record<string, unknown>) || {}

        if (toolId) {
          agent.activeToolIds.add(toolId)
          agent.activeToolNames.set(toolId, toolName)
        }

        const state = mapToolToState(toolName, toolInput)
        agent.currentState = state

        const detail = formatDetail(toolName, toolInput)

        broadcaster.emit({
          agentId: agent.id,
          state,
          tool: toolName,
          detail,
          timestamp: Date.now(),
        })
      }
    }
  } else if (record.type === 'user') {
    const content = (record.message as Record<string, unknown>)?.content
    if (Array.isArray(content)) {
      for (const block of content as Array<Record<string, unknown>>) {
        if (block.type === 'tool_result') {
          const toolId = (block.tool_use_id as string) || ''
          const toolName = agent.activeToolNames.get(toolId) || ''

          if (toolId) {
            agent.activeToolIds.delete(toolId)
            agent.activeToolNames.delete(toolId)
          }

          // Check for errors in tool output
          const resultContent = block.content
          let outputText = ''
          if (typeof resultContent === 'string') {
            outputText = resultContent
          } else if (Array.isArray(resultContent)) {
            outputText = (resultContent as Array<Record<string, unknown>>)
              .filter((c) => c.type === 'text')
              .map((c) => c.text as string)
              .join('\n')
          }

          const errorState = mapErrorToState(outputText)
          if (errorState) {
            agent.currentState = errorState
            const truncated =
              outputText.length > 80 ? outputText.slice(0, 80) + '…' : outputText
            broadcaster.emit({
              agentId: agent.id,
              state: errorState,
              tool: toolName,
              detail: truncated,
              timestamp: Date.now(),
            })
          } else if (agent.activeToolIds.size === 0) {
            // All tools done, back to thinking
            agent.currentState = 'thinking'
          }
        }
      }
    }
  } else if (
    record.type === 'system' &&
    (record as Record<string, unknown>).subtype === 'turn_duration'
  ) {
    // Turn complete — agent is now idle/thinking
    agent.activeToolIds.clear()
    agent.activeToolNames.clear()
    agent.currentState = 'thinking'
    broadcaster.emit({
      agentId: agent.id,
      state: 'thinking',
      tool: '',
      timestamp: Date.now(),
    })
  } else if (record.type === 'progress') {
    const data = (record as Record<string, unknown>).data as Record<string, unknown> | undefined
    if (!data) return

    const dataType = data.type as string | undefined
    if (dataType === 'agent_progress' || dataType === 'mcp_progress') {
      // Sub-agent activity — create a derived agentId
      const subagentId = `${agent.id}_sub`
      const toolName =
        typeof (data as Record<string, unknown>).tool_name === 'string'
          ? (data as Record<string, unknown>).tool_name as string
          : ''
      const toolInput = ((data as Record<string, unknown>).tool_input as Record<string, unknown>) || {}
      const state = mapToolToState(toolName, toolInput)
      const detail = formatDetail(toolName, toolInput)

      broadcaster.emit({
        agentId: subagentId,
        state,
        tool: toolName,
        detail,
        timestamp: Date.now(),
      })
    }
  }
}
