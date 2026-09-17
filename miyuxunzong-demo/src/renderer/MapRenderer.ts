import * as PIXI from 'pixi.js'

export interface MapPOI {
  id: string; x: number; y: number; label: string
  locked: boolean; completed?: boolean; tag: string
}

export interface NearbyPOI { id: string; label: string; dist: number }

const WORLD_W = 2000
const WORLD_H = 1200

export class MapRenderer {
  app: PIXI.Application
  private worldContainer: PIXI.Container
  private bgGfx: PIXI.Graphics
  private eagleBody: PIXI.Container
  private pois: Map<string, PIXI.Container> = new Map()
  private poiData: Map<string, MapPOI> = new Map()
  private onPOIClick?: (id: string) => void
  private mode: 'free' | 'mission' = 'free'
  private missionTargetIds: Set<string> = new Set()
  private eagleWorldX = WORLD_W / 2
  private eagleWorldY = WORLD_H / 2
  private viewW = 0
  private viewH = 0
  private movingDir = { x: 0, y: 0 }
  private speed = 4

  constructor() {
    this.app = new PIXI.Application()
    this.worldContainer = new PIXI.Container()
    this.bgGfx = new PIXI.Graphics()
    this.eagleBody = new PIXI.Container()
  }

  async init(canvas: HTMLCanvasElement) {
    const parent = canvas.parentElement
    if (!parent) return
    const rect = parent.getBoundingClientRect()
    this.viewW = rect.width
    this.viewH = rect.height

    canvas.style.display = 'block'
    canvas.style.width = `${this.viewW}px`
    canvas.style.height = `${this.viewH}px`
    canvas.style.background = '#2B1A0E'

    await this.app.init({
      background: '#2B1A0E',
      canvas,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
    })
    this.app.renderer.resize(this.viewW, this.viewH)

    this.stage.addChild(this.worldContainer)

    this.drawBackground()
    this.worldContainer.addChild(this.bgGfx)

    this.buildEagle()
    this.stage.addChild(this.eagleBody)

    this.startCamera()
  }

  private get stage() { return this.app.stage }

  private drawBackground() {
    const g = this.bgGfx
    g.clear()

    g.rect(0, 0, WORLD_W, WORLD_H).fill({ color: 0x4A6741 })

    const roadColor = 0x5C4033
    g.setStrokeStyle({ width: 6, color: roadColor, alpha: 0.5 })

    g.moveTo(400, 0).lineTo(400, WORLD_H).stroke()
    g.moveTo(800, 0).lineTo(800, WORLD_H).stroke()
    g.moveTo(0, 600).lineTo(WORLD_W, 600).stroke()

    g.rect(0, 0, WORLD_W, 8).fill({ color: 0x5C4033 })
    g.rect(0, WORLD_H - 8, WORLD_W, 8).fill({ color: 0x5C4033 })
    g.rect(0, 0, 8, WORLD_H).fill({ color: 0x5C4033 })
    g.rect(WORLD_W - 8, 0, 8, WORLD_H).fill({ color: 0x5C4033 })

    const bldgColor = 0x6B4F10
    const bldgs: [number, number, number, number][] = [
      [50, 150, 60, 50], [50, 350, 60, 50], [50, 550, 60, 50], [50, 750, 60, 50], [50, 950, 60, 50],
      [450, 200, 60, 50], [450, 400, 60, 50], [450, 600, 60, 50], [450, 800, 60, 50],
      [900, 250, 60, 50], [900, 450, 60, 50], [900, 650, 60, 50], [900, 100, 60, 50],
    ]
    for (const [bx, by, bw, bh] of bldgs) {
      g.rect(bx, by, bw, bh).fill({ color: bldgColor, alpha: 0.4 })
    }

    g.rect(850, 350, 80, 80).fill({ color: 0x2D5A27, alpha: 0.3 })

    const label = new PIXI.Text({
      text: '老北平城', style: { fill: '#D4B96A', fontSize: 14, fontFamily: 'serif', fontStyle: 'italic' },
    })
    label.anchor.set(0.5, 0.5)
    label.x = 180; label.y = 40
    this.worldContainer.addChild(label)

    const compass = new PIXI.Text({
      text: '北 ↑', style: { fill: '#8B6914', fontSize: 11 },
    })
    compass.anchor.set(0.5, 0.5)
    compass.x = WORLD_W - 60; compass.y = 30
    this.worldContainer.addChild(compass)
  }

  private buildEagle() {
    this.eagleBody.removeChildren()
    const body = new PIXI.Graphics()
    body.circle(0, 0, 7).fill({ color: 0x8B6914 }).stroke({ width: 1, color: 0xD4B96A })
    this.eagleBody.addChild(body)

    const emoji = new PIXI.Text({ text: '🦅', style: { fontSize: 18 } })
    emoji.anchor.set(0.5, 0.5)
    emoji.y = -18
    this.eagleBody.addChild(emoji)

    const glow = new PIXI.Graphics()
    glow.circle(0, 0, 14).fill({ color: 0xD4B96A, alpha: 0.12 })
    this.eagleBody.addChildAt(glow, 0)
  }

  private startCamera() {
    this.app.ticker.add(() => {
      if (this.movingDir.x !== 0 || this.movingDir.y !== 0) {
        const dt = this.app.ticker.deltaTime
        this.eagleWorldX += this.movingDir.x * this.speed * dt
        this.eagleWorldY += this.movingDir.y * this.speed * dt
        this.eagleWorldX = Math.max(20, Math.min(WORLD_W - 20, this.eagleWorldX))
        this.eagleWorldY = Math.max(20, Math.min(WORLD_H - 20, this.eagleWorldY))
      }

      const cx = this.viewW / 2
      const cy = this.viewH / 2
      this.worldContainer.x = cx - this.eagleWorldX
      this.worldContainer.y = cy - this.eagleWorldY
      this.eagleBody.x = cx
      this.eagleBody.y = cy

      if (this.movingDir.x !== 0 || this.movingDir.y !== 0) {
        this.eagleBody.rotation = Math.atan2(this.movingDir.y, this.movingDir.x) * -0.4
      } else {
        this.eagleBody.rotation *= 0.85
      }
    })
  }

  setPOIs(pois: MapPOI[], onClick: (id: string) => void) {
    this.onPOIClick = onClick
    for (const c of this.pois.values()) this.worldContainer.removeChild(c)
    this.pois.clear()
    this.poiData.clear()

    pois.forEach(p => {
      this.poiData.set(p.id, p)
      const c = new PIXI.Container()
      const bg = new PIXI.Graphics()
      const color = p.completed ? 0x5A7A4A : p.locked ? 0x666666 : 0xD4B96A
      bg.roundRect(-20, -20, 40, 40, 6).fill(color).stroke({ width: 2, color: 0x8B6914 })
      c.addChild(bg)

      const txt = new PIXI.Text({
        text: p.completed ? '✅' : (p.tag || p.label[0]),
        style: { fill: p.locked ? '#999' : p.completed ? '#8B6914' : '#3D4F3A', fontSize: 11, fontWeight: 'bold' },
      })
      txt.anchor.set(0.5, 0.5)
      c.addChild(txt)

      c.x = p.x; c.y = p.y
      c.eventMode = 'static'
      c.cursor = 'pointer'
      const pid = p.id
      c.on('pointertap', () => this.onPOIClick?.(pid))
      this.worldContainer.addChild(c)
      this.pois.set(p.id, c)
    })
  }

  setMissionTargets(targetIds: string[]) {
    this.missionTargetIds = new Set(targetIds)
    this.pois.forEach((c, id) => {
      const glow = this.missionTargetIds.has(id)
      const g = c.children[0] as PIXI.Graphics
      g.tint = glow ? 0xFFD700 : 0xFFFFFF
      c.alpha = glow ? 1 : (this.mode === 'mission' && !this.missionTargetIds.has(id) ? 0.4 : 0.85)
    })
  }

  setMode(mode: 'free' | 'mission') {
    this.mode = mode
    this.pois.forEach((c) => { c.alpha = 1; (c.children[0] as PIXI.Graphics).tint = 0xFFFFFF })
    if (mode === 'mission') this.setMissionTargets(Array.from(this.missionTargetIds))
  }

  startMoving(dx: number, dy: number) {
    const length = Math.hypot(dx, dy) || 1
    this.movingDir = { x: dx / length, y: dy / length }
  }

  stopMoving() {
    this.movingDir = { x: 0, y: 0 }
  }

  moveEagleTo(x: number, y: number) {
    this.eagleWorldX = Math.max(20, Math.min(WORLD_W - 20, x))
    this.eagleWorldY = Math.max(20, Math.min(WORLD_H - 20, y))
  }

  getEaglePos() {
    return { x: this.eagleWorldX, y: this.eagleWorldY }
  }

  getNearbyPOI(threshold = 45): NearbyPOI | null {
    let nearest: NearbyPOI | null = null
    for (const [id, p] of this.poiData) {
      if (p.locked) continue
      const dist = Math.sqrt((p.x - this.eagleWorldX) ** 2 + (p.y - this.eagleWorldY) ** 2)
      if (dist < threshold && (!nearest || dist < nearest.dist)) {
        nearest = { id, label: p.label, dist }
      }
    }
    return nearest
  }

  highlightPOI(id: string | null) {
    this.pois.forEach((c, pid) => {
      const g = c.children[0] as PIXI.Graphics
      if (pid === id) { g.tint = 0x00D4AA; c.scale.set(1.15) }
      else { g.tint = 0xFFFFFF; c.scale.set(1) }
    })
  }

  resize(w: number, h: number) {
    this.viewW = w; this.viewH = h
    this.app.renderer.resize(w, h)
  }

  getWorldSize() { return { w: WORLD_W, h: WORLD_H } }

  destroy() {
    this.app.ticker.destroy()
    this.app.destroy(true)
  }
}
