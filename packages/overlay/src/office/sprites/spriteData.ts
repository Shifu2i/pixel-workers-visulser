import type { SpriteData } from '../types'

const _ = '' // transparent

// ── Palettes ────────────────────────────────────────────────────

export const CHARACTER_PALETTES = [
  { skin: '#FFCC99', shirt: '#4488CC', pants: '#334466', hair: '#553322', shoes: '#222222' },
  { skin: '#FFCC99', shirt: '#CC4444', pants: '#333333', hair: '#FFD700', shoes: '#222222' },
  { skin: '#DEB887', shirt: '#44AA66', pants: '#334444', hair: '#222222', shoes: '#333333' },
  { skin: '#FFCC99', shirt: '#AA55CC', pants: '#443355', hair: '#AA4422', shoes: '#222222' },
  { skin: '#DEB887', shirt: '#CCAA33', pants: '#444433', hair: '#553322', shoes: '#333333' },
  { skin: '#FFCC99', shirt: '#FF8844', pants: '#443322', hair: '#111111', shoes: '#222222' },
] as const

interface CharPalette {
  skin: string
  shirt: string
  pants: string
  hair: string
  shoes: string
}

// Template symbols
const H = 'hair'
const K = 'skin'
const S = 'shirt'
const P = 'pants'
const O = 'shoes'
const E = '#FFFFFF' // eyes

type T = typeof H | typeof K | typeof S | typeof P | typeof O | typeof E | typeof _

function resolve(template: T[][], palette: CharPalette): SpriteData {
  return template.map((row) =>
    row.map((cell) => {
      if (cell === _) return ''
      if (cell === E) return '#FFFFFF'
      if (cell === H) return palette.hair
      if (cell === K) return palette.skin
      if (cell === S) return palette.shirt
      if (cell === P) return palette.pants
      if (cell === O) return palette.shoes
      return cell as string
    }),
  )
}

function flip(template: T[][]): T[][] {
  return template.map((row) => [...row].reverse())
}

// ── Down walk frames ─────────────────────────────────────────────

const WALK_DOWN_1: T[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,H,H,H,H,_,_,_,_,_,_],
  [_,_,_,_,_,H,H,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,H,H,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,K,E,K,K,E,K,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,_,S,S,S,S,_,_,_,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,S,S,S,S,S,S,S,S,_,_,_,_],
  [_,_,_,_,S,S,S,S,S,S,S,S,_,_,_,_],
  [_,_,_,_,K,S,S,S,S,S,S,K,_,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,_,_,P,P,P,P,_,_,_,_,_,_],
  [_,_,_,_,_,P,P,P,P,P,P,_,_,_,_,_],
  [_,_,_,_,_,P,P,P,P,P,P,_,_,_,_,_],
  [_,_,_,_,P,P,_,_,_,_,P,P,_,_,_,_],
  [_,_,_,_,P,P,_,_,_,_,P,P,_,_,_,_],
  [_,_,_,_,O,O,_,_,_,_,_,O,O,_,_,_],
  [_,_,_,_,O,O,_,_,_,_,_,O,O,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
]

const WALK_DOWN_2: T[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,H,H,H,H,_,_,_,_,_,_],
  [_,_,_,_,_,H,H,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,H,H,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,K,E,K,K,E,K,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,_,S,S,S,S,_,_,_,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,S,S,S,S,S,S,S,S,_,_,_,_],
  [_,_,_,_,S,S,S,S,S,S,S,S,_,_,_,_],
  [_,_,_,_,K,S,S,S,S,S,S,K,_,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,_,_,P,P,P,P,_,_,_,_,_,_],
  [_,_,_,_,_,P,P,P,P,P,P,_,_,_,_,_],
  [_,_,_,_,_,P,P,_,_,P,P,_,_,_,_,_],
  [_,_,_,_,_,P,P,_,_,P,P,_,_,_,_,_],
  [_,_,_,_,_,P,P,_,_,P,P,_,_,_,_,_],
  [_,_,_,_,_,O,O,_,_,O,O,_,_,_,_,_],
  [_,_,_,_,_,O,O,_,_,O,O,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
]

// ── Down type frames ─────────────────────────────────────────────

const TYPE_DOWN_1: T[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,H,H,H,H,_,_,_,_,_,_],
  [_,_,_,_,_,H,H,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,H,H,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,K,E,K,K,E,K,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,_,S,S,S,S,_,_,_,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,S,S,S,S,S,S,S,S,_,_,_,_],
  [_,_,_,K,K,S,S,S,S,S,S,K,K,_,_,_],
  [_,_,_,_,K,S,S,S,S,S,S,K,_,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,_,_,P,P,P,P,_,_,_,_,_,_],
  [_,_,_,_,_,P,P,P,P,P,P,_,_,_,_,_],
  [_,_,_,_,_,P,P,P,P,P,P,_,_,_,_,_],
  [_,_,_,_,_,P,P,_,_,P,P,_,_,_,_,_],
  [_,_,_,_,_,O,O,_,_,O,O,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
]

const TYPE_DOWN_2: T[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,H,H,H,H,_,_,_,_,_,_],
  [_,_,_,_,_,H,H,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,H,H,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,K,E,K,K,E,K,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,_,S,S,S,S,_,_,_,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,S,S,S,S,S,S,S,S,_,_,_,_],
  [_,_,_,_,K,S,S,S,S,S,S,K,K,_,_,_],
  [_,_,_,_,K,S,S,S,S,S,S,_,K,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,_,_,P,P,P,P,_,_,_,_,_,_],
  [_,_,_,_,_,P,P,P,P,P,P,_,_,_,_,_],
  [_,_,_,_,_,P,P,P,P,P,P,_,_,_,_,_],
  [_,_,_,_,_,P,P,_,_,P,P,_,_,_,_,_],
  [_,_,_,_,_,O,O,_,_,O,O,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
]

// ── Down read frames ─────────────────────────────────────────────

const READ_DOWN_1: T[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,H,H,H,H,_,_,_,_,_,_],
  [_,_,_,_,_,H,H,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,H,H,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,K,E,K,K,E,K,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,_,S,S,S,S,_,_,_,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,S,S,S,S,S,S,S,S,_,_,_,_],
  [_,_,_,_,S,S,S,S,S,S,S,S,_,_,_,_],
  [_,_,_,_,K,S,S,S,S,S,S,K,_,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,_,_,P,P,P,P,_,_,_,_,_,_],
  [_,_,_,_,_,P,P,P,P,P,P,_,_,_,_,_],
  [_,_,_,_,_,P,P,P,P,P,P,_,_,_,_,_],
  [_,_,_,_,_,P,P,_,_,P,P,_,_,_,_,_],
  [_,_,_,_,_,O,O,_,_,O,O,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
]

// ── Template catalogue ───────────────────────────────────────────

export interface CharacterSprites {
  walkDown: [SpriteData, SpriteData]
  typeDown: [SpriteData, SpriteData]
  readDown: SpriteData
  walkRight: [SpriteData, SpriteData]
  typeRight: [SpriteData, SpriteData]
  walkLeft: [SpriteData, SpriteData]
  typeLeft: [SpriteData, SpriteData]
  walkUp: [SpriteData, SpriteData]
}

function buildSprites(palette: CharPalette): CharacterSprites {
  const walkDown1 = resolve(WALK_DOWN_1, palette)
  const walkDown2 = resolve(WALK_DOWN_2, palette)
  const typeDown1 = resolve(TYPE_DOWN_1, palette)
  const typeDown2 = resolve(TYPE_DOWN_2, palette)
  const readDown1 = resolve(READ_DOWN_1, palette)

  // Side sprites derived from down sprites (simplified)
  const walkRight1 = walkDown1.map((row) => [...row].reverse())
  const walkRight2 = walkDown2.map((row) => [...row].reverse())
  const typeRight1 = typeDown1.map((row) => [...row].reverse())
  const typeRight2 = typeDown2.map((row) => [...row].reverse())
  const walkLeft1 = walkRight1
  const walkLeft2 = walkRight2
  const typeLeft1 = typeRight1
  const typeLeft2 = typeRight2
  const walkUp1 = walkDown1
  const walkUp2 = walkDown2

  return {
    walkDown: [walkDown1, walkDown2],
    typeDown: [typeDown1, typeDown2],
    readDown: readDown1,
    walkRight: [walkRight1, walkRight2],
    typeRight: [typeRight1, typeRight2],
    walkLeft: [walkLeft1, walkLeft2],
    typeLeft: [typeLeft1, typeLeft2],
    walkUp: [walkUp1, walkUp2],
  }
}

// Build all 6 palettes at module load
const SPRITE_CACHE: CharacterSprites[] = CHARACTER_PALETTES.map((p) =>
  buildSprites(p as CharPalette),
)

export function getCharacterSprites(paletteIndex: number): CharacterSprites {
  return SPRITE_CACHE[paletteIndex % SPRITE_CACHE.length]
}

// ── Furniture sprites ────────────────────────────────────────────

const W = '#8B6914' // wood edge
const L = '#A07828' // lighter wood
const Sf = '#B8922E' // surface
const D = '#6B4E0A' // dark edge

export const DESK_SPRITE: SpriteData = (() => {
  const rows: string[][] = []
  rows.push(new Array(32).fill(''))
  rows.push(['', ...new Array(30).fill(W), ''])
  for (let r = 0; r < 4; r++) {
    rows.push(['', W, ...new Array(28).fill(r < 1 ? L : Sf), W, ''])
  }
  rows.push(['', D, ...new Array(28).fill(W), D, ''])
  for (let r = 0; r < 6; r++) {
    rows.push(['', W, ...new Array(28).fill(Sf), W, ''])
  }
  rows.push(['', W, ...new Array(28).fill(L), W, ''])
  for (let r = 0; r < 6; r++) {
    rows.push(['', W, ...new Array(28).fill(Sf), W, ''])
  }
  rows.push(['', D, ...new Array(28).fill(W), D, ''])
  for (let r = 0; r < 4; r++) {
    rows.push(['', W, ...new Array(28).fill(r > 2 ? L : Sf), W, ''])
  }
  rows.push(['', ...new Array(30).fill(W), ''])
  for (let r = 0; r < 6; r++) {
    const row = new Array(32).fill('')
    row[1] = D; row[2] = D; row[29] = D; row[30] = D
    rows.push(row)
  }
  return rows
})()

export const CHAIR_SPRITE: SpriteData = (() => {
  const CW = '#8B6914'
  const CD = '#6B4E0A'
  const CB = '#3D2B06'
  const BL = '#224488'
  return [
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    [_,_,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,_,_],
    [_,CB,BL,BL,BL,BL,BL,BL,BL,BL,BL,BL,BL,BL,CB,_],
    [_,CB,BL,BL,BL,BL,BL,BL,BL,BL,BL,BL,BL,BL,CB,_],
    [_,CB,BL,BL,BL,BL,BL,BL,BL,BL,BL,BL,BL,BL,CB,_],
    [_,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,CB,_],
    [_,_,CW,CW,_,_,_,_,_,_,_,_,CW,CW,_,_],
    [_,_,CW,CW,CW,CW,CW,CW,CW,CW,CW,CW,CW,CW,_,_],
    [_,_,CW,CW,CW,CW,CW,CW,CW,CW,CW,CW,CW,CW,_,_],
    [_,_,CW,CW,CW,CW,CW,CW,CW,CW,CW,CW,CW,CW,_,_],
    [_,_,CW,CW,CW,CW,CW,CW,CW,CW,CW,CW,CW,CW,_,_],
    [_,_,_,CD,_,_,_,_,_,_,_,_,CD,_,_,_],
    [_,_,_,CD,_,_,_,_,_,_,_,_,CD,_,_,_],
    [_,_,CD,CD,_,_,_,_,_,_,_,_,CD,CD,_,_],
    [_,CD,CD,_,_,_,_,_,_,_,_,_,_,CD,CD,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  ]
})()

export const PLANT_SPRITE: SpriteData = (() => {
  const G = '#3D8B37'
  const Dg = '#2D6B27'
  const T = '#6B4E0A'
  const Pt = '#B85C3A'
  const R = '#8B4422'
  return [
    [_,_,_,_,_,_,G,G,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,G,G,G,G,_,_,_,_,_,_,_],
    [_,_,_,_,G,G,Dg,G,G,G,_,_,_,_,_,_],
    [_,_,_,G,G,Dg,G,G,Dg,G,G,_,_,_,_,_],
    [_,_,G,G,G,G,G,G,G,G,G,G,_,_,_,_],
    [_,G,G,Dg,G,G,G,G,G,G,Dg,G,G,_,_,_],
    [_,G,G,G,G,Dg,G,G,Dg,G,G,G,G,_,_,_],
    [_,_,G,G,G,G,G,G,G,G,G,G,_,_,_,_],
    [_,_,_,G,G,G,Dg,G,G,G,G,_,_,_,_,_],
    [_,_,_,_,G,G,G,G,G,G,_,_,_,_,_,_],
    [_,_,_,_,_,_,T,T,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,T,T,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,R,R,R,R,R,_,_,_,_,_,_],
    [_,_,_,_,R,Pt,Pt,Pt,Pt,Pt,R,_,_,_,_,_],
    [_,_,_,_,R,Pt,Pt,Pt,Pt,Pt,R,_,_,_,_,_],
    [_,_,_,_,_,R,Pt,Pt,Pt,R,_,_,_,_,_,_],
  ]
})()

// Bubble sprites
export const BUBBLE_THINKING: SpriteData = [
  [_,'#CCCCCC',_],
  ['#CCCCCC','#FFFFFF','#CCCCCC'],
  [_,'#CCCCCC',_],
]

export const EXCLAMATION_SPRITE: SpriteData = [
  [_,'#FF3333',_],
  [_,'#FF3333',_],
  [_,'#FF3333',_],
  [_,_,_],
  [_,'#FF3333',_],
]
