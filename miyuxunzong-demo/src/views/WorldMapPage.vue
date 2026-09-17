<template>
  <main class="map-page">
    <header class="topbar map-topbar">
      <div><p class="eyebrow">淬火 1937 · 北平情报网</p><h1>全域探索地图</h1></div>
      <div class="actions"><button @click="toggleMode">{{ mode === 'free' ? '🗺 自由探索' : '🎯 任务探索' }}</button><button @click="router.push('/worlds')">← 世界</button><button @click="router.push('/profile')">👤</button></div>
    </header>
    <section ref="board" class="map-board" tabindex="0" aria-label="可探索地图" @click="moveByClick">
      <i v-for="(point, index) in trail" :key="index" class="trail-dot" :style="{ left: `${point.x}%`, top: `${point.y}%` }"></i>
      <button v-for="poi in visiblePois" :key="poi.id" class="map-pin" :class="{ done: poi.chapter && store.completedChapters.includes(poi.chapter), target: poi.id === missionTarget?.id }" :style="{ left: `${poi.x}%`, top: `${poi.y}%` }" @click.stop="moveTo(poi)">
        <b>{{ poi.icon }}</b><span>{{ poi.label }}</span>
      </button>
      <div class="eagle-marker" :style="{ left: `${eagle.x}%`, top: `${eagle.y}%` }"><img class="eagle-icon" src="/assets/eagle.png" alt="情报鹰" /><span>情报鹰</span></div>
      <aside v-if="nearbyPoi" class="poi-arrival"><strong>{{ nearbyPoi.label }}</strong><span>{{ nearbyPoi.description }}</span><button class="primary" @click.stop="enterPoi(nearbyPoi)">进入</button></aside>
      <div class="map-legend"><span><img class="legend-eagle" src="/assets/eagle.png" alt="" /> 点击地图或使用 WASD / 方向键移动</span><span v-if="mode === 'mission'">当前目标：{{ missionTarget?.label ?? '全部任务完成' }}</span></div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { chapterLabels } from '../data/gameData'
import { useGameStore } from '../stores/gameStore'

type PoiKind = 'chapter' | 'station' | 'quiz' | 'fragment' | 'market'
interface Poi { id: string; label: string; description: string; icon: string; kind: PoiKind; x: number; y: number; chapter?: string }
interface Point { x: number; y: number }

const router = useRouter()
const store = useGameStore()
const board = ref<HTMLElement | null>(null)
const mode = ref<'free' | 'mission'>('mission')
const eagle = ref<Point>({ x: 48, y: 54 })
const eagleTarget = ref<Point>({ x: 48, y: 54 })
const trail = ref<Point[]>([{ x: 48, y: 54 }])
const pressedKeys = new Set<string>()
let movementFrame = 0
let smoothingFrame = 0

// 坐标根据 map_1.jpg 图片地标位置标定（百分比 left, top）
// 工厂(14,22) 五星大楼(57,16) 红旗衙门(59,48) 商铺(57,72) 三人物(82,69)
const chapterPositions = [[14,22],[57,16],[59,48],[39,52],[82,69]]
const chapterPois: Poi[] = chapterLabels.map((chapter, index) => ({
  id: `chapter:${chapter.id}`, label: chapter.title, description: '主线剧情任务', icon: String(index + 1), kind: 'chapter', chapter: chapter.id,
  x: chapterPositions[index]?.[0] ?? 50, y: chapterPositions[index]?.[1] ?? 50,
}))
// 只保留西城情报站（雷达塔位置 82,19），其余功能点对齐图片地标
const utilities: Poi[] = [
  { id:'station:west', label:'西城情报站', description:'线索交接与密码验证', icon:'📡', kind:'station', x:82, y:19 },
  { id:'quiz', label:'国安题库', description:'完成知识问答', icon:'📝', kind:'quiz', x:38, y:46 },
  { id:'fragment', label:'情报碎片', description:'查看英烈故事收集', icon:'🧩', kind:'fragment', x:25, y:44 },
  { id:'market', label:'虚拟市集', description:'兑换虚拟道具与装扮', icon:'🏪', kind:'market', x:57, y:72 },
]
const missionTarget = computed(() => chapterPois.find(poi => poi.chapter && !store.completedChapters.includes(poi.chapter)) ?? null)
const visiblePois = computed(() => mode.value === 'mission' && missionTarget.value ? [...utilities, missionTarget.value] : [...chapterPois, ...utilities])
const nearbyPoi = computed(() => {
  const candidates = visiblePois.value
  let closest: Poi | null = null
  let distance = Infinity
  for (const poi of candidates) {
    const value = Math.hypot(eagle.value.x - poi.x, eagle.value.y - poi.y)
    if (value < distance) { distance = value; closest = poi }
  }
  return distance <= 6.2 ? closest : null
})

function toggleMode() { mode.value = mode.value === 'free' ? 'mission' : 'free' }
function moveTo(point: Point) { setTarget(point.x, point.y) }
function moveByClick(event: MouseEvent) {
  const rect = board.value?.getBoundingClientRect(); if (!rect) return
  setTarget(((event.clientX - rect.left) / rect.width) * 100, ((event.clientY - rect.top) / rect.height) * 100)
}
function setTarget(x: number, y: number) {
  eagleTarget.value = { x: Math.max(3, Math.min(97, x)), y: Math.max(5, Math.min(95, y)) }
}
function smoothEagle() {
  const dx = eagleTarget.value.x - eagle.value.x; const dy = eagleTarget.value.y - eagle.value.y
  if (Math.abs(dx) + Math.abs(dy) > .03) {
    eagle.value = { x: eagle.value.x + dx * .14, y: eagle.value.y + dy * .14 }
    const previous = trail.value[trail.value.length - 1]
    if (!previous || Math.hypot(previous.x - eagle.value.x, previous.y - eagle.value.y) > 1.1) trail.value = [...trail.value.slice(-24), { ...eagle.value }]
  }
  smoothingFrame = requestAnimationFrame(smoothEagle)
}
function enterPoi(poi: Poi) {
  if (poi.kind === 'chapter' && poi.chapter) router.push(`/narrative/${poi.chapter}`)
  else if (poi.kind === 'station') router.push('/station/tempered_1937/station_1')
  else if (poi.kind === 'quiz') router.push('/cinema/tempered_1937')
  else if (poi.kind === 'fragment') router.push('/fragments/tempered_1937')
  else router.push('/market/tempered_1937')
}
const movement: Record<string, Point> = { w:{x:0,y:-1}, a:{x:-1,y:0}, s:{x:0,y:1}, d:{x:1,y:0}, ArrowUp:{x:0,y:-1}, ArrowLeft:{x:-1,y:0}, ArrowDown:{x:0,y:1}, ArrowRight:{x:1,y:0} }
function onKeyDown(event: KeyboardEvent) { if (event.key === 'Enter' && nearbyPoi.value) { event.preventDefault(); enterPoi(nearbyPoi.value); return } if (!movement[event.key]) return; event.preventDefault(); pressedKeys.add(event.key); startMovement() }
function onKeyUp(event: KeyboardEvent) { if (!movement[event.key]) return; pressedKeys.delete(event.key) }
function startMovement() { if (!movementFrame) movementFrame = requestAnimationFrame(tick) }
function tick() {
  let x = 0; let y = 0
  pressedKeys.forEach(key => { x += movement[key]?.x ?? 0; y += movement[key]?.y ?? 0 })
  if (!x && !y) { movementFrame = 0; return }
  const length = Math.hypot(x, y) || 1
  setTarget(eagleTarget.value.x + (x / length) * .42, eagleTarget.value.y + (y / length) * .42)
  movementFrame = requestAnimationFrame(tick)
}
function stopMovement() { pressedKeys.clear(); if (movementFrame) cancelAnimationFrame(movementFrame); movementFrame = 0 }
onMounted(() => { window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp); window.addEventListener('blur', stopMovement); board.value?.focus(); smoothingFrame = requestAnimationFrame(smoothEagle) })
onUnmounted(() => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); window.removeEventListener('blur', stopMovement); stopMovement(); if (smoothingFrame) cancelAnimationFrame(smoothingFrame) })
</script>