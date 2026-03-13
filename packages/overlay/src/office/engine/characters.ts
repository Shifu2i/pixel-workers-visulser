import type { AgentInfo } from '../../types'
import { CharacterState, Direction, TILE_SIZE } from '../types'
import type { Character, Seat } from '../types'
import { getCharacterSprites } from '../sprites/spriteData'
import type { SpriteData } from '../types'

const TYPE_FRAME_DURATION_SEC = 0.15
const IDLE_FRAME_DURATION_SEC = 0.4
const JITTER_INTERVAL_SEC = 0.05

// 6 fixed seats mapped to desk positions in the office background image.
// Image is ~640×800px = 40×50 tiles at 16px.
// Row 1: upper workspace (3 desks side-by-side around y≈200, row ~13)
// Row 2: lower workspace (3 desks side-by-side around y≈330, row ~21)
export const OFFICE_SEATS: Seat[] = [
  { col: 7,  row: 20, facingDir: Direction.DOWN },  // 0 — left desk, upper row
  { col: 16, row: 20, facingDir: Direction.DOWN },  // 1 — center desk, upper row
  { col: 25, row: 20, facingDir: Direction.DOWN },  // 2 — right desk, upper row
  { col: 7,  row: 28, facingDir: Direction.DOWN },  // 3 — left desk, lower row
  { col: 16, row: 28, facingDir: Direction.DOWN },  // 4 — center desk, lower row
  { col: 25, row: 28, facingDir: Direction.DOWN },  // 5 — right desk, lower row
]

export function tileCenter(col: number, row: number): { x: number; y: number } {
  return {
    x: col * TILE_SIZE + TILE_SIZE / 2,
    y: row * TILE_SIZE + TILE_SIZE / 2,
  }
}

export function createCharacter(agentInfo: AgentInfo): Character {
  const seat = OFFICE_SEATS[agentInfo.seatIndex % OFFICE_SEATS.length]
  const pos = tileCenter(seat.col, seat.row)
  return {
    id: agentInfo.agentId,
    label: agentInfo.label,
    paletteIndex: agentInfo.seatIndex % 6,
    state: CharacterState.TYPE,
    dir: seat.facingDir,
    x: pos.x,
    y: pos.y,
    tileCol: seat.col,
    tileRow: seat.row,
    frame: 0,
    frameTimer: 0,
    isActive: true,
    isErroring: false,
    seatIndex: agentInfo.seatIndex,
    jitterX: 0,
    jitterTimer: 0,
  }
}

export function updateCharacter(ch: Character, dt: number, agentInfo: AgentInfo | undefined): void {
  if (!agentInfo) return

  ch.isActive = agentInfo.state !== 'thinking'
  ch.isErroring = agentInfo.state === 'erroring'
  ch.label = agentInfo.label

  // Update FSM state based on agent activity
  if (ch.isErroring) {
    ch.state = CharacterState.TYPE // frozen pose
    // Jitter
    ch.jitterTimer += dt
    if (ch.jitterTimer >= JITTER_INTERVAL_SEC) {
      ch.jitterTimer -= JITTER_INTERVAL_SEC
      ch.jitterX = ch.jitterX === 0 ? 1 : 0
    }
  } else {
    ch.jitterX = 0

    if (ch.isActive) {
      ch.state = CharacterState.TYPE
    } else {
      ch.state = CharacterState.IDLE
    }
  }

  // Advance frame
  const frameDuration =
    ch.state === CharacterState.IDLE
      ? IDLE_FRAME_DURATION_SEC
      : TYPE_FRAME_DURATION_SEC

  ch.frameTimer += dt
  if (ch.frameTimer >= frameDuration) {
    ch.frameTimer -= frameDuration
    ch.frame = (ch.frame + 1) % 2
  }
}

export function getCharacterSprite(ch: Character, agentState: string | undefined): SpriteData {
  const sprites = getCharacterSprites(ch.paletteIndex)
  const frame = ch.frame % 2

  if (ch.state === CharacterState.IDLE) {
    return sprites.walkDown[frame]
  }

  // TYPE state — differentiate by actual agent state
  const isReading = agentState === 'reading' || agentState === 'thinking'
  if (isReading) {
    return sprites.readDown
  }

  return sprites.typeDown[frame]
}
