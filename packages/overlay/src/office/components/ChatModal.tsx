import { useEffect, useRef, useState } from 'react'
import type { ChatMessage } from '../../types'
import './ChatModal.css'

const STATE_COLORS: Record<string, string> = {
  writing: '#1AFF1A',
  reading: '#1A8CFF',
  testing: '#FFD700',
  committing: '#FF8C1A',
  thinking: '#C77DFF',
  erroring: '#FF4444',
}

interface ChatModalProps {
  agentId: string
  agentLabel: string
  agentState: string
  onClose: () => void
  sendChat: (agentId: string, prompt: string) => void
  messages: ChatMessage[]
  streaming: boolean
}

export function ChatModal({
  agentId,
  agentLabel,
  agentState,
  onClose,
  sendChat,
  messages,
  streaming,
}: ChatModalProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    sendChat(agentId, trimmed)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const dotColor = STATE_COLORS[agentState] ?? '#888'

  return (
    <div className="chat-modal-overlay" onClick={handleOverlayClick}>
      <div className="chat-modal">
        <div className="chat-modal-header">
          <div className="chat-modal-header-left">
            <span className="state-dot" style={{ background: dotColor }} />
            <span>{agentLabel}</span>
          </div>
          <button className="chat-modal-close-btn" onClick={onClose}>
            X
          </button>
        </div>

        <div className="chat-modal-messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-assistant'}
            >
              {msg.text}
              {streaming && msg.role === 'assistant' && i === messages.length - 1 && (
                <span className="chat-streaming-cursor" />
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input
            className="chat-input"
            type="text"
            placeholder="Send a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button
            className="chat-send-btn"
            onClick={handleSubmit}
            disabled={!input.trim() || streaming}
          >
            SEND
          </button>
        </div>
      </div>
    </div>
  )
}
