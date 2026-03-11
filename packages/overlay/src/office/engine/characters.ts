import type { AgentInfo } from '../../types'
import { CharacterState, Direction, TILE_SIZE } from '../types'
import type { Character, Seat } from '../types'
import { getCharacterSprites } from '../sprites/spriteData'
import type { SpriteData } from '../types'

const TYPE_FRAME_DURATION_SEC = 0.15
const IDLE_FRAME_DURATION_SEC = 0.4
const JITTER_INTERVAL_SEC = 0.05

// 6 fixed seats for the office layout
// Canvas is TILE_SIZE * COLS wide. Seats at these tile positions:
export const OFFICE_SEATS: Seat[] = [
  { col: 7,  row: 5,  facingDir: Direction.DOWN },  // 0 CODER
  { col: 22, row: 5,  facingDir: Direction.DOWN },  // 1 TESTER
  { col: 37, row: 5,  facingDir: Direction.DOWN },  // 2 READER
  { col: 7,  row: 20, facingDir: Direction.DOWN },  // 3 PLANNER
  { col: 22, row: 20, facingDir: Direction.DOWN },  // 4 DEPLOYER
  { col: 37, row: 20, facingDir: Direction.DOWN },  // 5 DEBUGGER
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
