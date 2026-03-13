import type { AgentInfo } from '../../types'
import type { Character, FurnitureItem } from '../types'
import { TILE_SIZE } from '../types'
import { DESK_SPRITE, CHAIR_SPRITE, PLANT_SPRITE } from '../sprites/spriteData'
import { createCharacter, updateCharacter, OFFICE_SEATS } from './characters'

// Office dimensions matching the background image (~640×800 at 16px tiles)
export const OFFICE_COLS = 40
export const OFFICE_ROWS = 50

export class OfficeState {
  characters = new Map<string, Character>()
  furniture: FurnitureItem[] = []

  constructor() {
    this.buildFurniture()
  }

  private buildFurniture(): void {
    // Furniture is only used in fallback (procedural) mode
    // When the bg image is loaded, the image contains all furniture
    for (let i = 0; i < OFFICE_SEATS.length; i++) {
      const seat = OFFICE_SEATS[i]

      // Desk (32×32 sprite = 2×2 tiles) — placed one tile above seat
      const deskCol = seat.col - 1
      const deskRow = seat.row - 2
      this.furniture.push({
        sprite: DESK_SPRITE,
        x: deskCol * TILE_SIZE,
        y: deskRow * TILE_SIZE,
        zY: (deskRow + 2) * TILE_SIZE,
      })

      // Chair at seat position (16×16 = 1×1 tile)
      this.furniture.push({
        sprite: CHAIR_SPRITE,
        x: seat.col * TILE_SIZE,
        y: seat.row * TILE_SIZE,
        zY: (seat.row + 1) * TILE_SIZE,
      })
    }

    // Decorative plants in corners
    const corners = [
      { col: 1, row: 1 },
      { col: OFFICE_COLS - 3, row: 1 },
      { col: 1, row: OFFICE_ROWS - 3 },
      { col: OFFICE_COLS - 3, row: OFFICE_ROWS - 3 },
    ]
    for (const { col, row } of corners) {
      this.furniture.push({
        sprite: PLANT_SPRITE,
        x: col * TILE_SIZE,
        y: row * TILE_SIZE,
        zY: (row + 2) * TILE_SIZE,
      })
    }
  }

  update(dt: number, agentInfos: Map<string, AgentInfo>): void {
    // Add/update characters
    for (const [agentId, info] of agentInfos) {
      let ch = this.characters.get(agentId)
      if (!ch) {
        ch = createCharacter(info)
        this.characters.set(agentId, ch)
      }
      updateCharacter(ch, dt, info)
    }

    // Remove characters for agents that no longer exist
    for (const agentId of this.characters.keys()) {
      if (!agentInfos.has(agentId)) {
        this.characters.delete(agentId)
      }
    }
  }
}
