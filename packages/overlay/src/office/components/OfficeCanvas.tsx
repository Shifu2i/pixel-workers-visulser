import { useEffect, useRef } from 'react'
import type { AgentInfo } from '../../types'
import { OfficeState } from '../engine/officeState'
import { OFFICE_COLS, OFFICE_ROWS } from '../engine/officeState'
import { TILE_SIZE } from '../types'
import { startGameLoop } from '../engine/gameLoop'
import { renderOffice } from '../engine/renderer'

const ZOOM = 2
const LOGICAL_W = OFFICE_COLS * TILE_SIZE
const LOGICAL_H = OFFICE_ROWS * TILE_SIZE

interface Props {
  agents: Map<string, AgentInfo>
  glowColor: string
}

export function OfficeCanvas({ agents, glowColor }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<OfficeState | null>(null)
  const agentsRef = useRef<Map<string, AgentInfo>>(agents)

  // Keep agentsRef up to date without restarting game loop
  agentsRef.current = agents

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = LOGICAL_W * ZOOM
    canvas.height = LOGICAL_H * ZOOM

    const officeState = new OfficeState()
    stateRef.current = officeState

    const stop = startGameLoop(canvas, {
      update: (dt) => {
        officeState.update(dt, agentsRef.current)
      },
      render: (ctx) => {
        renderOffice(ctx, officeState, agentsRef.current, ZOOM)
      },
    })

    return stop
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
        style={{
          imageRendering: 'pixelated',
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      />
    </div>
  )
}
