/** 2D array of hex color strings ('' = transparent) */
export type SpriteData = string[][]

export const TILE_SIZE = 16

export const CharacterState = {
  IDLE: 'idle',
  WALK: 'walk',
  TYPE: 'type',
  READ: 'read',
} as const
export type CharacterState = (typeof CharacterState)[keyof typeof CharacterState]

export const Direction = {
  DOWN: 0,
  LEFT: 1,
  RIGHT: 2,
  UP: 3,
} as const
export type Direction = (typeof Direction)[keyof typeof Direction]

export interface Seat {
  col: number
  row: number
  facingDir: Direction
}

export interface Character {
  id: string
  label: string
  paletteIndex: number
  state: CharacterState
  dir: Direction
  x: number
  y: number
  tileCol: number
  tileRow: number
  frame: number
  frameTimer: number
  isActive: boolean
  isErroring: boolean
  seatIndex: number
  jitterX: number
  jitterTimer: number
}

export interface FurnitureItem {
  sprite: SpriteData
  x: number
  y: number
  zY: number
}
