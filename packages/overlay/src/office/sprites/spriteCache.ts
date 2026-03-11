import type { SpriteData } from '../types'

// WeakMap: sprite → (zoom → offscreen canvas)
const cache = new WeakMap<SpriteData, Map<number, HTMLCanvasElement>>()

export function getCachedSprite(sprite: SpriteData, zoom: number): HTMLCanvasElement {
  let zoomMap = cache.get(sprite)
  if (!zoomMap) {
    zoomMap = new Map()
    cache.set(sprite, zoomMap)
  }

  let canvas = zoomMap.get(zoom)
  if (canvas) return canvas

  const rows = sprite.length
  const cols = rows > 0 ? sprite[0].length : 0

  canvas = document.createElement('canvas')
  canvas.width = cols * zoom
  canvas.height = rows * zoom

  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const color = sprite[r][c]
      if (!color) continue
      ctx.fillStyle = color
      ctx.fillRect(c * zoom, r * zoom, zoom, zoom)
    }
  }

  zoomMap.set(zoom, canvas)
  return canvas
}

export function clearSpriteCache(): void {
  // WeakMap entries are GC'd automatically — this is a no-op but exported for explicit use
}
