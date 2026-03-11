import type { OfficeState } from './officeState'
import { OFFICE_COLS, OFFICE_ROWS } from './officeState'
import { TILE_SIZE } from '../types'
import { getCachedSprite } from '../sprites/spriteCache'
import { getCharacterSprite } from './characters'
import type { AgentInfo } from '../../types'

// Color constants from design system
const COLOR_DARK = '#0D0D0D'
const COLOR_FLOOR = '#1A1A2E'
const COLOR_FLOOR_ALT = '#16213E'
const COLOR_WALL = '#0F3460'
const COLOR_GRID = '#1E1E3F'

export function renderOffice(
  ctx: CanvasRenderingContext2D,
  state: OfficeState,
  agentInfos: Map<string, AgentInfo>,
  zoom: number,
): void {
  const canvasW = ctx.canvas.width
  const canvasH = ctx.canvas.height

  // Clear
  ctx.fillStyle = COLOR_DARK
  ctx.fillRect(0, 0, canvasW, canvasH)

  // Draw floor tiles
  for (let r = 0; r < OFFICE_ROWS; r++) {
    for (let c = 0; c < OFFICE_COLS; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? COLOR_FLOOR : COLOR_FLOOR_ALT
      ctx.fillRect(
        Math.round(c * TILE_SIZE * zoom),
        Math.round(r * TILE_SIZE * zoom),
        Math.round(TILE_SIZE * zoom),
        Math.round(TILE_SIZE * zoom),
      )
    }
  }

  // Draw wall at top
  ctx.fillStyle = COLOR_WALL
  ctx.fillRect(0, 0, canvasW, Math.round(2 * TILE_SIZE * zoom))

  // Collect all drawables (furniture + characters) for z-sorting
  interface ZDrawable {
    zY: number
    draw: () => void
  }
  const drawables: ZDrawable[] = []

  // Furniture
  for (const item of state.furniture) {
    const cached = getCachedSprite(item.sprite, zoom)
    const fx = Math.round(item.x * zoom)
    const fy = Math.round(item.y * zoom)
    drawables.push({
      zY: item.zY,
      draw: () => ctx.drawImage(cached, fx, fy),
    })
  }

  // Characters
  for (const ch of state.characters.values()) {
    const agentInfo = agentInfos.get(ch.id)
    const sprite = getCharacterSprite(ch, agentInfo?.state)
    const cached = getCachedSprite(sprite, zoom)
    const drawX = Math.round(ch.x * zoom - cached.width / 2) + ch.jitterX
    const drawY = Math.round(ch.y * zoom - cached.height)

    // Label above character
    const labelText = ch.label
    const drawXCapture = drawX
    const drawYCapture = drawY
    const cachedCapture = cached

    drawables.push({
      zY: ch.y + TILE_SIZE / 2,
      draw: () => {
        // Erroring: red tint overlay
        if (ch.isErroring) {
          ctx.globalAlpha = 0.3
          ctx.fillStyle = '#FF3333'
          ctx.fillRect(drawXCapture, drawYCapture, cachedCapture.width, cachedCapture.height)
          ctx.globalAlpha = 1.0
        }
        ctx.drawImage(cachedCapture, drawXCapture, drawYCapture)

        // Label
        ctx.font = `${Math.max(6, Math.round(6 * zoom / 2))}px "Press Start 2P", monospace`
        ctx.textAlign = 'center'
        ctx.fillStyle = ch.isErroring ? '#FF3333' : '#F5F5FF'
        ctx.fillText(labelText, drawXCapture + cachedCapture.width / 2, drawYCapture - 4)
        ctx.textAlign = 'left'

        // Exclamation for erroring
        if (ch.isErroring) {
          ctx.fillStyle = '#FF3333'
          ctx.font = `bold ${Math.round(8 * zoom / 2)}px monospace`
          ctx.textAlign = 'center'
          ctx.fillText('!', drawXCapture + cachedCapture.width / 2, drawYCapture - 12)
          ctx.textAlign = 'left'
        }
      },
    })
  }

  // Sort by zY (depth)
  drawables.sort((a, b) => a.zY - b.zY)
  for (const d of drawables) {
    d.draw()
  }
}
