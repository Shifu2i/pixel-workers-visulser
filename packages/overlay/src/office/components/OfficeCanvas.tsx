import { useEffect, useRef, useCallback } from 'react'
import type { AgentInfo } from '../../types'
import { OfficeState } from '../engine/officeState'
import { OFFICE_COLS, OFFICE_ROWS } from '../engine/officeState'
import { TILE_SIZE } from '../types'
import { startGameLoop } from '../engine/gameLoop'
import { renderOffice, initRenderer } from '../engine/renderer'

const ZOOM = 2
const LOGICAL_W = OFFICE_COLS * TILE_SIZE
const LOGICAL_H = OFFICE_ROWS * TILE_SIZE

interface Props {
  agents: Map<string, AgentInfo>
  glowColor: string
  onAgentClick?: (agentId: string) => void
}

export function OfficeCanvas({ agents, glowColor, onAgentClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<OfficeState | null>(null)
  const agentsRef = useRef<Map<string, AgentInfo>>(agents)

  // Keep agentsRef up to date without restarting game loop
  agentsRef.current = agents

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onAgentClick || !stateRef.current || !canvasRef.current) return

      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()

      // Convert mouse position to canvas logical coordinates
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const mx = (e.clientX - rect.left) * scaleX
      const my = (e.clientY - rect.top) * scaleY

      // Hit-test each character (sprite is ~16×23px at zoom)
      const SPRITE_W = 16 * ZOOM
      const SPRITE_H = 23 * ZOOM
      const HIT_PADDING = 8 * ZOOM // generous click area

      for (const ch of stateRef.current.characters.values()) {
        const cx = ch.x * ZOOM - SPRITE_W / 2
        const cy = ch.y * ZOOM - SPRITE_H

        if (
          mx >= cx - HIT_PADDING &&
          mx <= cx + SPRITE_W + HIT_PADDING &&
          my >= cy - HIT_PADDING &&
          my <= cy + SPRITE_H + HIT_PADDING
        ) {
          onAgentClick(ch.id)
          return
        }
      }
    },
    [onAgentClick],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = LOGICAL_W * ZOOM
    canvas.height = LOGICAL_H * ZOOM

    const officeState = new OfficeState()
    stateRef.current = officeState

    let stopLoop: (() => void) | null = null

    // Init renderer (loads bg image), then start game loop
    initRenderer().then(() => {
      stopLoop = startGameLoop(canvas, {
        update: (dt) => {
          officeState.update(dt, agentsRef.current)
        },
        render: (ctx) => {
          renderOffice(ctx, officeState, agentsRef.current, ZOOM)
        },
      })
    })

    return () => {
      stopLoop?.()
    }
  }, [])

  return (
    <div
      className="canvas-wrapper"
      style={{
        boxShadow: glowColor ? `0 0 30px 8px ${glowColor}44` : undefined,
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          imageRendering: 'pixelated',
          maxWidth: '100%',
          maxHeight: '100%',
          cursor: 'pointer',
        }}
      />
    </div>
  )
}
