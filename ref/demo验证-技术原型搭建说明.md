# 密羽寻踪 · Demo 验证文档

> 纯技术验证原型 | 无任何美术素材依赖 | 所有贴图用文字/CSS 占位
> 目标：**用最简代码跑通当前 H5 MVP 的核心系统**，证明架构可行后，再逐步替换真实资源。视频、小程序封装、组队、线下打卡和实体交易均不属于本原型范围。

---

## 一、验证目标

| # | 系统 | 验证项 | 占位方案 |
|---|------|--------|---------|
| 1 | 项目脚手架 | Vite+HMR 正常、路由跳转正常 | — |
| 2 | 叙事引擎 | JSON 驱动对话/选项/数值/条件门控/多结局 | 占位文本角色 |
| 3 | 地图系统 | PixiJS 渲染背景、POI 点击、鹰移动动画 | CSS 色块 + 文字标签 |
| 4 | 情报站 | 密码输入、任务流程闭环 | 纯文字描述 |
| 5 | 题库答题 | 问答 Modal、重复机制 | 纯文本/图片题目，不依赖视频 |
| 6 | 碎片收集 | 碎片条件解锁、集齐合成 | 文字卡牌 |
| 7 | 存档系统 | IndexedDB 保存/读取/删除，关键节点自动存档 | — |

---

## 二、项目初始化

```bash
npm create vite@latest miyuxunzong-demo -- --template vue-ts
cd miyuxunzong-demo
npm install
npm install pixi.js@8 gsap howler vue-router@4 pinia idb-keyval
```

### 路由配置 `src/router/index.ts`

```typescript
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/',            name: 'home',     component: () => import('../views/HomePage.vue') },
  { path: '/worlds',      name: 'worlds',   component: () => import('../views/WorldSelectPage.vue') },
  { path: '/map/:worldId', name: 'map',     component: () => import('../views/WorldMapPage.vue') },
  { path: '/narrative/:chapterId/:sceneId?', name: 'narrative', component: () => import('../views/NarrativePage.vue') },
  { path: '/station/:worldId/:stationId', name: 'station',     component: () => import('../views/StationPage.vue') },
  { path: '/cinema/:worldId', name: 'cinema', component: () => import('../views/CinemaPage.vue') },
  { path: '/market/:worldId', name: 'market', component: () => import('../views/MarketPage.vue') },
  { path: '/profile',     name: 'profile',  component: () => import('../views/ProfilePage.vue') },
]

export default createRouter({ history: createWebHashHistory(), routes })
```

### `src/types/index.ts` — 核心类型

```typescript
export interface PlayerStats {
  suspicion: number; insight: number; conviction: number
  trust_father: number; trust_org: number; worry: number
}
export interface StatEffect { stat: string; change: number }
export interface InventoryChange { add?: string[]; remove?: string[] }
export interface Choice {
  text: string; nextNodeId: string; effects?: StatEffect[]
  inventoryChanges?: InventoryChange; condition?: Condition
}
export interface Condition {
  stat: string; operator: '>='|'<='|'>'|'<'|'=='; value: number
  passNodeId?: string; failNodeId?: string
}
export interface Node {
  id: string; type: 'dialogue'|'narration'|'choice'|'condition'|'action'|'ending'
  speaker?: string; content?: string
  choices?: Choice[]; condition?: Condition
  effects?: StatEffect[]; inventoryChanges?: InventoryChange
  nextNodeId?: string; endingType?: string; endingDescription?: string
}
export interface Scene { id: string; bgLabel: string; nodes: Node[] }
export interface Chapter { id: string; title: string; scenes: Scene[] }
export interface Script { meta: {id:string;title:string}; chapters: Chapter[] }

export interface POI {
  id: string; type: string; x: number; y: number; label: string
  locked: boolean; unlockCondition?: { requireChapter?: string }
}
export interface WorldMap { worldId: string; pois: POI[] }

export interface Quiz {
  id: string; sourceType: 'movie'|'knowledge'; type: 'single'|'judge'
  question: string; options?: string[]; answer: string|boolean
  explanation: string; rewards: { feathers: number }
}

export interface Fragment {
  id: string; groupId: string; order: number; content: string
  unlockCondition: { type: 'quest'|'quiz'|'explore'; refId: string }
}
export interface FragmentGroup { id: string; heroName: string; fragments: Fragment[] }

export interface SaveData {
  version: string; lastSaved: number
  stats: PlayerStats; inventory: { feathers: number; items: string[] }
  progress: { currentChapter: string; completedChapters: string[] }
  quiz: Record<string, { wrongAttempts: number; passed: boolean }>
  collectibles: { fragments: string[]; fragmentGroups: Record<string,{collected:number;complete:boolean}> }
  metadata: { playTime: number; endingsUnlocked: string[] }
}
```

### Pinia Store `src/stores/gameStore.ts`

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PlayerStats, SaveData, Node } from '../types'

export const useGameStore = defineStore('game', () => {
  const stats = ref<PlayerStats>({ suspicion:0, insight:3, conviction:5, trust_father:0, trust_org:0, worry:0 })
  const feathers = ref(0)
  const items = ref<string[]>([])
  const fragments = ref<string[]>([])
  const endingsUnlocked = ref<string[]>([])
  const completedChapters = ref<string[]>([])
  const currentChapter = ref('')
  const currentScene = ref('')
  const currentNode = ref<Node | null>(null)
  const quizRecords = ref<Record<string,{wrongAttempts:number;passed:boolean}>>({})

  const conviction = computed(() => stats.value.conviction)
  const suspicion = computed(() => stats.value.suspicion)

  function applyEffects(effects?: { stat: string; change: number }[]) {
    effects?.forEach(e => {
      const key = e.stat as keyof PlayerStats
      if (key in stats.value) (stats.value as any)[key] += e.change
    })
  }

  function addItem(id: string) { if (!items.value.includes(id)) items.value.push(id) }
  function removeItem(id: string) { items.value = items.value.filter(i => i !== id) }
  function addFeathers(n: number) { feathers.value += n }
  function addFragment(id: string) { if (!fragments.value.includes(id)) fragments.value.push(id) }
  function unlockEnding(type: string) { if (!endingsUnlocked.value.includes(type)) endingsUnlocked.value.push(type) }
  function completeChapter(id: string) { if (!completedChapters.value.includes(id)) completedChapters.value.push(id) }

  function evaluateCondition(cond: { stat:string; operator:string; value:number }): boolean {
    const val = (stats.value as any)[cond.stat] ?? 0
    switch (cond.operator) {
      case '>=': return val >= cond.value
      case '<=': return val <= cond.value
      case '>':  return val > cond.value
      case '<':  return val < cond.value
      case '==': return val === cond.value
      default: return true
    }
  }

  function toSaveData(): SaveData {
    return {
      version: '1.0.0', lastSaved: Date.now(),
      stats: { ...stats.value },
      inventory: { feathers: feathers.value, items: [...items.value] },
      progress: { currentChapter: currentChapter.value, completedChapters: [...completedChapters.value] },
      quiz: { ...quizRecords.value },
      collectibles: { fragments: [...fragments.value], fragmentGroups: {} },
      metadata: { playTime: 0, endingsUnlocked: [...endingsUnlocked.value] },
    }
  }

  function loadSave(data: SaveData) {
    stats.value = { ...data.stats }
    feathers.value = data.inventory.feathers
    items.value = [...data.inventory.items]
    fragments.value = [...data.collectibles.fragments]
    completedChapters.value = [...data.progress.completedChapters]
    endingsUnlocked.value = [...data.metadata.endingsUnlocked]
    quizRecords.value = { ...data.quiz }
  }

  return {
    stats, feathers, items, fragments, endingsUnlocked, completedChapters,
    currentChapter, currentScene, currentNode, quizRecords,
    conviction, suspicion,
    applyEffects, addItem, removeItem, addFeathers, addFragment,
    unlockEnding, completeChapter, evaluateCondition, toSaveData, loadSave,
  }
})
```

---

## 三、七个系统的 Demo 实现

### 系统 1：叙事引擎 (FSM)

**核心文件**：`src/engine/NarrativeEngine.ts`

```typescript
import { useGameStore } from '../stores/gameStore'
import type { Script, Node } from '../types'

export class NarrativeEngine {
  private script: Script
  private chapterIdx = 0
  private sceneIdx = 0
  private nodeIdx = 0
  private store = useGameStore()

  constructor(script: Script) { this.script = script }

  get currentChapter() { return this.script.chapters[this.chapterIdx] }
  get currentScene() { return this.currentChapter?.scenes[this.sceneIdx] }
  get currentNode(): Node | null { return this.currentScene?.nodes[this.nodeIdx] ?? null }

  async load(url: string) {
    const resp = await fetch(url)
    this.script = await resp.json()
    this.chapterIdx = 0; this.sceneIdx = 0; this.nodeIdx = 0
  }

  advance(): Node | null {
    const node = this.currentNode
    if (!node) return null

    switch (node.type) {
      case 'dialogue':
      case 'narration':
        if (node.effects) this.store.applyEffects(node.effects)
        if (node.inventoryChanges) {
          node.inventoryChanges.add?.forEach(i => this.store.addItem(i))
          node.inventoryChanges.remove?.forEach(i => this.store.removeItem(i))
        }
        if (node.nextNodeId) this.goToNode(node.nextNodeId)
        break
      case 'action':
        if (node.effects) this.store.applyEffects(node.effects)
        if (node.nextNodeId) this.goToNode(node.nextNodeId)
        break
      case 'condition':
        if (node.condition) {
          const pass = this.store.evaluateCondition(node.condition)
          this.goToNode(pass ? node.condition.passNodeId! : node.condition.failNodeId!)
        }
        break
      case 'ending':
        this.store.unlockEnding(node.endingType || 'unknown')
        break
    }
    return this.currentNode
  }

  selectChoice(choiceIdx: number) {
    const node = this.currentNode
    if (!node || node.type !== 'choice') return
    const choice = node.choices?.[choiceIdx]
    if (!choice) return
    if (choice.effects) this.store.applyEffects(choice.effects)
    if (choice.inventoryChanges) {
      choice.inventoryChanges.add?.forEach(i => this.store.addItem(i))
      choice.inventoryChanges.remove?.forEach(i => this.store.removeItem(i))
    }
    this.goToNode(choice.nextNodeId)
  }

  private goToNode(nodeId: string) {
    for (let ci = 0; ci < this.script.chapters.length; ci++) {
      for (let si = 0; si < this.script.chapters[ci].scenes.length; si++) {
        const ni = this.script.chapters[ci].scenes[si].nodes.findIndex(n => n.id === nodeId)
        if (ni >= 0) {
          this.chapterIdx = ci; this.sceneIdx = si; this.nodeIdx = ni
          return
        }
      }
    }
  }
}
```

### 系统 2：地图系统 (PixiJS)

**核心文件**：`src/renderer/MapRenderer.ts`

```typescript
import * as PIXI from 'pixi.js'
import { gsap } from 'gsap'

export class MapRenderer {
  app: PIXI.Application
  private eagle: PIXI.Graphics
  private pois: PIXI.Container[] = []
  private onPOIClick?: (id: string) => void

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.app = new PIXI.Application()
    this.eagle = new PIXI.Graphics()
  }

  async init() {
    await this.app.init({ background: '#3D4F3A', resizeTo: undefined })
    const bg = new PIXI.Graphics()
    bg.rect(0, 0, 375, 667).fill('#3D4F3A')
    // 占位：绘制文字标签代替地图
    const label = new PIXI.Text({ text: '[淬火1937 地图占位]', style: { fill: '#D4B96A', fontSize: 20 } })
    label.x = 60; label.y = 300
    this.app.stage.addChild(bg, label)
    this.app.canvas.style.width = '375px'
    this.app.canvas.style.height = '667px'
  }

  setPOIs(pois: { id: string; x: number; y: number; label: string }[], onClick: (id: string) => void) {
    this.onPOIClick = onClick
    pois.forEach(p => {
      const c = new PIXI.Container()
      const circle = new PIXI.Graphics()
      circle.circle(0, 0, 18).fill('#D4B96A').stroke({ width: 2, color: '#8B6914' })
      const text = new PIXI.Text({ text: p.label, style: { fill: '#F5E6C8', fontSize: 10 } })
      text.y = 24; text.x = -text.width / 2
      c.addChild(circle, text)
      c.x = p.x; c.y = p.y
      c.eventMode = 'static'
      c.cursor = 'pointer'
      c.on('pointertap', () => this.onPOIClick?.(p.id))
      this.app.stage.addChild(c)
      this.pois.push(c)
    })
  }

  moveEagleTo(x: number, y: number) {
    gsap.to(this.eagle, { x, y, duration: 0.6, ease: 'power2.inOut' })
  }
}
```

**WorldMapPage.vue**（占位容器）：

```vue
<template>
  <div style="position:relative;width:375px;height:667px;background:#3D4F3A;">
    <div ref="mapContainer" style="width:100%;height:100%;"></div>
    <div v-for="poi in pois" :key="poi.id"
      @click="onPOIClick(poi.id)"
      :style="{
        position:'absolute', left:poi.x+'px', top:poi.y+'px',
        width:'36px', height:'36px', borderRadius:'50%',
        background: poi.locked ? '#666' : '#D4B96A',
        border: '2px solid #8B6914', cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:'10px', color: poi.locked ? '#999' : '#3D4F3A'
      }">
      {{ poi.label[0] }}
    </div>
    <div style="position:absolute;top:10px;left:10px;color:#F5E6C8;font-size:12px;">
      🦅 情报鹰 · ({{ eagleX }}, {{ eagleY }})
    </div>
    <div style="position:absolute;bottom:10px;left:0;right:0;text-align:center;">
      <button @click="toggleMode" style="margin:4px;padding:6px 12px;">
        {{ mode === 'free' ? '自由探索' : '任务探索' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const mode = ref<'free'|'mission'>('free')
const pois = ref([
  { id:'station_1', x:80, y:200, label:'情报站·甲', locked:false },
  { id:'cinema', x:250, y:150, label:'电影院', locked:false },
  { id:'cinema', x:180, y:400, label:'商城市集', locked:false },
  { id:'secret', x:300, y:500, label:'秘密接头', locked:true },
])
const eagleX = ref(375/2)
const eagleY = ref(667/2)
function onPOIClick(id: string) { /* 路由跳转 */ }
function toggleMode() { mode.value = mode.value === 'free' ? 'mission' : 'free' }
</script>
```

### 系统 3：情报站

**StationPage.vue**：

```vue
<template>
  <div style="width:375px;height:667px;background:#2B1A0E;color:#F5E6C8;padding:20px;">
    <h2>📡 情报站 · {{ $route.params.stationId }}</h2>
    <p>{{ taskDescription }}</p>
    <div v-if="step === 'password'">
      <p>🔐 请输入密码（提示：十六字方针首字拼音）</p>
      <input v-model="passwordInput" style="width:200px;" />
      <button @click="checkPassword" style="margin-left:8px;">确认</button>
      <p v-if="passwordError" style="color:#ff6b6b;">密码错误</p>
    </div>
    <div v-else-if="step === 'done'">
      <p>✅ 情报破译成功！ 羽毛 +{{ reward }}</p>
      <button @click="$router.back()">返回地图</button>
    </div>
    <button @click="$router.back()" style="margin-top:20px;">← 返回</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const taskDescription = '获取敌军营地部署情报。破译这封密电，找出敌军仓库位置。'
const passwordInput = ref('')
const step = ref<'password'|'done'>('password')
const passwordError = ref(false)
const reward = 5
function checkPassword() {
  if (passwordInput.value === 'yljb') { // 荫精长埋
    step.value = 'done'
    passwordError.value = false
  } else {
    passwordError.value = true
  }
}
</script>
```

### 系统 4：题库答题（不含视频）

**CinemaPage.vue**：

```vue
<template>
  <div style="width:375px;min-height:667px;background:#1A1A2E;color:#fff;padding:20px;">
    <h2>📝 国安题库 · 淬火1937</h2>
    <div v-for="m in movies" :key="m.id" style="margin:12px 0;padding:12px;background:#2A2A4E;border-radius:8px;">
      <h3>{{ m.title }}</h3>
      <button @click="startQuiz(m)" style="margin-top:8px;">
        {{ quizRecords[m.id]?.passed ? '✅ 已通过' : '📝 答题' }}
      </button>
    </div>

    <!-- 答题 Modal -->
    <div v-if="activeQuiz" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;">
      <div style="background:#1A1A2E;padding:24px;border-radius:12px;max-width:320px;">
        <h3>{{ activeQuiz.question }}</h3>
        <div v-if="activeQuiz.type === 'single'">
          <div v-for="(opt, i) in activeQuiz.options" :key="i" style="margin:8px 0;">
            <button @click="submitQuizAnswer(opt)" style="width:100%;padding:8px;">
              {{ opt }}
            </button>
          </div>
        </div>
        <div v-else>
          <button @click="submitQuizAnswer('true')" style="margin:4px;padding:8px 16px;">正确</button>
          <button @click="submitQuizAnswer('false')" style="margin:4px;padding:8px 16px;">错误</button>
        </div>
        <div v-if="quizResult !== null">
          <p :style="{color: quizResult ? '#4CAF50' : '#ff6b6b'}">
            {{ quizResult ? '✅ 答对了！' : '❌ 答错了' }}
          </p>
          <p v-if="!quizResult">{{ activeQuiz.explanation }}</p>
          <p v-if="activeQuiz.wrongCount && activeQuiz.wrongCount >= 3" style="color:#ff6b6b;">
            已答错3次，本题暂时锁定
          </p>
          <button @click="closeQuiz">继续</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useGameStore } from '../stores/gameStore'
const store = useGameStore()

const movies = [
  { id:'movie_1', title:'永不消逝的电波', quizIdx:0 },
  { id:'movie_2', title:'野火春风斗古城', quizIdx:1 },
]
const quizRecords = reactive(store.quizRecords)

const quizBank = [
  { id:'m1_q1', sourceType:'movie', type:'single', question:'李侠冒死保护的密码本最接近于需要严加保护的？', options:['个人隐私','国家秘密载体','商业专利','文物古董'], answer:'国家秘密载体', explanation:'属于国家秘密载体', rewards:{feathers:3} },
  { id:'m2_q1', sourceType:'movie', type:'judge', question:'假扮夫妻的真实身份连邻居也不能告知，体现了"不该说的秘密不说"。', answer:'true', explanation:'正确，保密纪律', rewards:{feathers:3} },
]

const activeQuiz = ref<any>(null)
const quizResult = ref<boolean|null>(null)

function startQuiz(movie: any) {
  const q = quizBank[movie.quizIdx]
  activeQuiz.value = { ...q, wrongCount: store.quizRecords[q.id]?.wrongAttempts || 0 }
  quizResult.value = null
}

function submitQuizAnswer(answer: string) {
  if (!activeQuiz.value) return
  const q = activeQuiz.value
  const correct = answer === q.answer
  quizResult.value = correct
  if (correct) {
    store.addFeathers(q.rewards.feathers)
    store.quizRecords[q.id] = { wrongAttempts: q.wrongCount || 0, passed: true }
  } else {
    const cnt = (q.wrongCount || 0) + 1
    store.quizRecords[q.id] = { wrongAttempts: cnt, passed: false }
    q.wrongCount = cnt
  }
}

function closeQuiz() { activeQuiz.value = null }
</script>
```

### 系统 5：碎片收集

**碎片页面**（嵌入在地图页或独立路由）：

```vue
<template>
  <div style="width:375px;padding:20px;background:#2B1A0E;color:#F5E6C8;">
    <h2>🧩 情报碎片 · 张永兴</h2>
    <div v-for="(f, i) in fragments" :key="f.id"
      :style="{
        padding:'12px', margin:'8px 0', borderRadius:'8px',
        background: collectedIds.includes(f.id) ? '#3D5A3A' : '#1A1A1A',
        color: collectedIds.includes(f.id) ? '#F5E6C8' : '#666',
        cursor: collectedIds.includes(f.id) ? 'pointer' : 'default'
      }"
      @click="collectedIds.includes(f.id) && showDetail(f)">
      <strong>第{{ f.order }}片</strong>
      <span v-if="!collectedIds.includes(f.id)"> 🔒 未解锁</span>
      <span v-else> ✅ 已收集</span>
      <p v-if="!collectedIds.includes(f.id)" style="font-size:12px;color:#999;">
        条件：{{ f.unlockCondition.type === 'quiz' ? '完成指定答题' : '完成指定任务' }}
      </p>
    </div>
    <div v-if="allCollected" style="margin-top:16px;padding:16px;background:#8B6914;border-radius:8px;text-align:center;">
      🎉 全部集齐！合成完整故事
    </div>
    <!-- 详情 Modal -->
    <div v-if="detail" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;">
      <div style="background:#2B1A0E;padding:24px;border-radius:12px;max-width:320px;">
        <p style="font-style:italic;color:#D4B96A;">"{{ detail.content }}"</p>
        <p style="margin-top:12px;color:#8B6914;">—— {{ detail.spirit || '忠魂不灭' }}</p>
        <button @click="detail=null" style="margin-top:12px;">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
const store = useGameStore()
const collectedIds = computed(() => store.fragments)
const fragments = [
  { id:'zhang_1', groupId:'zhang', order:1, content:'入党那年我把弟弟也推了出去，情报工作成了老张家一生卸不下的担子。', unlockCondition:{type:'quest', refId:'prologue'}, spirit:'忠诚' },
  { id:'zhang_2', groupId:'zhang', order:2, content:'送货、修路、搬运货物，我们"苦力"侦察组一寸寸摸清了日军机密。', unlockCondition:{type:'explore', refId:'map_station_1'}, spirit:'坚韧' },
  { id:'zhang_3', groupId:'zhang', order:3, content:'杂货铺里的电台声淹没在算盘声中，一年内数段重要情报从手中流过。', unlockCondition:{type:'quiz', refId:'m1_q1'}, spirit:'智慧' },
  { id:'zhang_4', groupId:'zhang', order:4, content:'灌水酷刑、妻女入狱…即便粉身碎骨，也必与日寇血战到底。', unlockCondition:{type:'quest', refId:'chapter2'}, spirit:'勇敢' },
  { id:'zhang_5', groupId:'zhang', order:5, content:'倘若人人都只顾小家，我们的民族又何以前行？我在黑暗中蛰伏，终在22年迎来新生。', unlockCondition:{type:'quest', refId:'ending_safe'}, spirit:'奉献' },
]
const allCollected = computed(() => fragments.every(f => collectedIds.value.includes(f.id)))
const detail = ref<any>(null)
function showDetail(f: any) { detail.value = f }
</script>
```

### 系统 6：商城市集

**MarketPage.vue**：

```vue
<template>
  <div style="width:375px;min-height:667px;background:#1A1A1A;color:#F5E6C8;padding:20px;">
    <h2>🏪 商城市集</h2>
    <p>🪶 羽毛: {{ store.feathers }}</p>
    <div v-for="item in shop" :key="item.id" style="margin:8px 0;padding:12px;background:#2A2A2A;border-radius:8px;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <strong>{{ item.name }}</strong>
        <span style="margin-left:8px;font-size:12px;color:#D4B96A;">{{ item.price }} 🪶</span>
      </div>
      <button @click="buy(item)" :disabled="store.feathers < item.price">
        {{ store.feathers >= item.price ? '兑换' : '不足' }}
      </button>
    </div>
    <div v-if="message" style="margin-top:12px;padding:8px;background:#3D5A3A;border-radius:4px;">
      {{ message }}
    </div>
    <button @click="$router.back()" style="margin-top:20px;">← 返回</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '../stores/gameStore'
const store = useGameStore()
const message = ref('')
const shop = [
  { id:'outfit_1', name:'暗夜行者装扮', price:20 },
  { id:'item_1', name:'情报解码器', price:10 },
  { id:'outfit_2', name:'渡鸦皮肤', price:50 },
]
function buy(item: {id:string; name:string; price:number}) {
  if (store.feathers < item.price) return
  store.addFeathers(-item.price)
  store.addItem(item.id)
  message.value = `✅ 成功兑换 ${item.name}`
}
</script>
```

### 系统 7：存档系统

**SaveManager.ts**：

```typescript
import { get, set, del } from 'idb-keyval'
import { useGameStore } from '../stores/gameStore'
import type { SaveData } from '../types'

const SAVE_KEY = 'miyuxunzong_demo_save'
const AUTO_KEY = 'miyuxunzong_demo_auto'

export async function saveGame(slot: 'manual' | 'auto' = 'manual') {
  const store = useGameStore()
  const key = slot === 'auto' ? AUTO_KEY : SAVE_KEY
  await set(key, store.toSaveData())
}

export async function loadGame(slot: 'manual' | 'auto' = 'manual'): Promise<boolean> {
  const key = slot === 'auto' ? AUTO_KEY : SAVE_KEY
  const data: SaveData | undefined = await get(key)
  if (!data) return false
  const store = useGameStore()
  store.loadSave(data)
  return true
}

export async function deleteSave() {
  await del(SAVE_KEY)
  await del(AUTO_KEY)
}

export async function autoSave() {
  await saveGame('auto')
}

export async function hasSave(): Promise<boolean> {
  return !!(await get(SAVE_KEY))
}
```

---

## 四、Demo 剧本 · 最小验证用

**`public/data/scripts/demo.json`**

> 占位剧本：仅 1 章 3 场景，走通 choice→condition→ending 全链路。

```json
{
  "meta": { "id": "demo", "title": "Demo验证" },
  "chapters": [{
    "id": "demo_chapter",
    "title": "验证章节",
    "scenes": [
      {
        "id": "scene_1",
        "bgLabel": "教室",
        "nodes": [
          { "id": "n1", "type": "narration", "content": "【占位】北平，1937年夏。你接到第一项任务。", "nextNodeId": "n2" },
          { "id": "n2", "type": "dialogue", "speaker": "联络员", "content": "同志，组织需要你回家探亲，相机了解社会动态。", "effects": [{"stat":"conviction","change":1}], "nextNodeId": "n3" },
          { "id": "n3", "type": "choice", "content": "你如何回应？",
            "choices": [
              { "text": "坚定接受任务", "effects":[{"stat":"conviction","change":2}], "nextNodeId":"n4" },
              { "text": "犹豫询问风险", "effects":[{"stat":"conviction","change":-1},{"stat":"suspicion","change":1}], "nextNodeId":"n4" }
            ]
          },
          { "id": "n4", "type": "narration", "content": "【占位】你收拾行李，准备离校。", "nextNodeId": "condition_check" },
          { "id": "condition_check", "type": "condition", "condition": { "stat":"conviction", "operator":">=", "value":6, "passNodeId":"ending_good", "failNodeId":"ending_bad" } },
          { "id": "ending_good", "type": "ending", "endingType":"firm", "endingDescription":"信念坚定，踏上了征途。" },
          { "id": "ending_bad", "type": "ending", "endingType":"wavering", "endingDescription":"信念不足，你在半路退缩了。" }
        ]
      },
      {
        "id": "scene_2",
        "bgLabel": "火车站",
        "nodes": [
          { "id": "s2n1", "type": "narration", "content": "【占位】前门火车站，军警林立。", "nextNodeId": "s2n2" },
          { "id": "s2n2", "type": "choice", "content": "排队时你注意到什么？",
            "choices": [
              { "text": "观察前方检查流程", "effects":[{"stat":"insight","change":2}], "nextNodeId":"s2n3" },
              { "text": "低头不语，尽快通过", "nextNodeId":"s2n3" }
            ]
          },
          { "id": "s2n3", "type": "dialogue", "speaker": "军警", "content": "箱子打开！", "nextNodeId": "s2n4" },
          { "id": "s2n4", "type": "choice", "content": "箱子里有一本《大众哲学》",
            "choices": [
              { "text": "说这是课本", "effects":[{"stat":"suspicion","change":-2}], "nextNodeId":"s2n5" },
              { "text": "紧张沉默", "effects":[{"stat":"suspicion","change":5}], "nextNodeId":"s2n5" }
            ]
          },
          { "id": "s2n5", "type": "narration", "content": "【占位】你通过了检查。/ 被带到了审讯室。", "nextNodeId": "s2_ending" },
          { "id": "s2_ending", "type": "condition", "condition": { "stat":"suspicion", "operator":">=", "value":30, "passNodeId":"ending_caught", "failNodeId":"ending_pass" } },
          { "id": "ending_caught", "type": "ending", "endingType":"caught", "endingDescription":"被捕。怀疑值过高。" },
          { "id": "ending_pass", "type": "narration", "content": "【占位】你顺利登车，踏上南下之路。", "nextNodeId": "scene_2_complete" },
          { "id": "scene_2_complete", "type": "action", "effects":[], "nextNodeId":"scene_2_done" },
          { "id": "scene_2_done", "type": "ending", "endingType":"safe", "endingDescription":"安全通过车站，继续旅程。" }
        ]
      }
    ]
  }]
}
```

---

## 五、NarrativePage.vue · 剧本驱动页面

```vue
<template>
  <div style="width:375px;height:667px;background:#2B1A0E;display:flex;flex-direction:column;color:#F5E6C8;">
    <!-- 场景占位 -->
    <div style="flex:1;display:flex;align-items:center;justify-content:center;background:#3D4F3A;">
      <span style="font-size:24px;opacity:0.5;">[{{ engine?.currentScene?.bgLabel || '场景' }}]</span>
    </div>
    <!-- 底部面板 -->
    <div style="padding:16px;background:#1A1A1A;border-top:2px solid #8B6914;">
      <div v-if="node?.type === 'dialogue'">
        <strong>{{ node.speaker }}：</strong>
      </div>
      <p style="min-height:40px;font-size:14px;">{{ displayText }}</p>
      <div v-if="node?.type === 'choice' && !transitioning">
        <button v-for="(c, i) in node.choices" :key="i" @click="onChoice(i)"
          :style="{ display:'block', width:'100%', margin:'6px 0', padding:'10px', background:'#2B1A0E', border:'1px solid #8B6914', color:'#D4B96A', borderRadius:'6px' }">
          {{ c.text }}
        </button>
      </div>
      <div v-else-if="node?.type === 'ending'" style="text-align:center;padding:12px;">
        <p style="font-size:18px;color:#D4B96A;">{{ node.endingDescription }}</p>
        <p style="font-size:12px;margin-top:8px;">结局类型: {{ node.endingType }}</p>
        <button @click="$router.push('/worlds')" style="margin-top:12px;">回到世界选择</button>
      </div>
      <button v-if="canContinue" @click="continueNarrative" style="margin-top:8px;padding:8px 16px;">
        {{ node?.type === 'ending' ? '结束' : '继续 →' }}
      </button>
    </div>
    <!-- 数值浮动提示 -->
    <div v-if="lastEffects.length" style="position:absolute;top:50%;right:10px;font-size:12px;">
      <div v-for="e in lastEffects" :key="e.stat" :style="{color: e.change > 0 ? '#4CAF50' : '#ff6b6b'}">
        {{ e.stat }} {{ e.change > 0 ? '+' : '' }}{{ e.change }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import { NarrativeEngine } from '../engine/NarrativeEngine'
import { autoSave } from '../engine/SaveManager'
const store = useGameStore()
const route = useRoute()
const engine = ref<NarrativeEngine | null>(null)
const displayText = ref('加载中...')
const transitioning = ref(false)
const lastEffects = ref<{stat:string;change:number}[]>([])
const node = computed(() => engine.value?.currentNode ?? null)
const canContinue = computed(() => {
  if (!node.value) return false
  return ['dialogue','narration','action','ending'].includes(node.value.type)
})

async function loadScript() {
  const eng = new NarrativeEngine({ meta: {id:'demo',title:'Demo'}, chapters:[] })
  await eng.load(`${import.meta.env.BASE_URL}data/scripts/demo.json`)
  engine.value = eng
  updateDisplay()
}

function updateDisplay() {
  const n = node.value
  if (!n) { displayText.value = '—'; return }
  if (n.type === 'dialogue' || n.type === 'narration') displayText.value = n.content || ''
  else if (n.type === 'choice') displayText.value = n.content || ''
  else if (n.type === 'ending') displayText.value = ''
  else if (n.type === 'condition') displayText.value = '判定中...'
  else if (n.type === 'action') displayText.value = n.content || ''
  transitioning.value = false
  if (n.type === 'condition' || n.type === 'action') {
    const next = engine.value!.advance()
    transitioning.value = true
    if (next) setTimeout(updateDisplay, 300)
  }
}

function continueNarrative() {
  if (!engine.value) return
  const prevNode = node.value
  lastEffects.value = prevNode?.effects || []
  const next = engine.value.advance()
  if (next) {
    setTimeout(updateDisplay, 200)
    autoSave()
    if (next.type === 'condition' || next.type === 'action') {
      transitioning.value = true
    }
  }
}

function onChoice(idx: number) {
  if (!engine.value) return
  const n = node.value
  if (!n || n.type !== 'choice') return
  const choice = n.choices?.[idx]
  if (!choice) return
  lastEffects.value = choice.effects || []
  engine.value.selectChoice(idx)
  autoSave()
  transitioning.value = true
  setTimeout(updateDisplay, 300)
}

onMounted(loadScript)
</script>
```

---

## 六、WorldSelectPage.vue · 世界选择

```vue
<template>
  <div style="width:375px;min-height:667px;background:#1A1A1A;color:#F5E6C8;padding:20px;">
    <h1 style="text-align:center;color:#D4B96A;">密羽寻踪</h1>
    <p style="text-align:center;font-size:12px;margin-bottom:20px;">—— 国家安全教育沉浸式互动平台 ——</p>
    <div v-for="w in worlds" :key="w.id"
      :style="{
        padding:'16px', margin:'8px 0', borderRadius:'8px',
        background: w.unlocked ? w.color : '#2A2A2A',
        opacity: w.unlocked ? 1 : 0.5,
        cursor: w.unlocked ? 'pointer' : 'not-allowed'
      }"
      @click="w.unlocked && $router.push(`/map/${w.id}`)">
      <h3>{{ w.label }}</h3>
      <p style="font-size:12px;">{{ w.desc }}</p>
      <span style="font-size:11px;">{{ w.unlocked ? '🟢 已解锁' : '🔒 待开放' }}</span>
    </div>
    <div style="margin-top:20px;text-align:center;">
      <button @click="$router.push('/profile')" style="margin:4px;">个人中心</button>
      <button @click="$router.push('/settings')" style="margin:4px;">设置</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '../stores/gameStore'
const store = useGameStore()
const worlds = [
  { id:'tempered_1937', label:'淬火 1937', desc:'七七事变·潜伏敌后', unlocked:true, color:'#3D4F3A' },
  { id:'dawn_1927', label:'破晓 1927', desc:'白色恐怖·建立特科', unlocked:false, color:'#2B1A0E' },
  { id:'decisive_1948', label:'决战 1948', desc:'战略决战·情报决胜', unlocked:false, color:'#4A6B3A' },
  { id:'newborn_1949', label:'新生 1949', desc:'开国大典·反特除奸', unlocked:false, color:'#1A2A4A' },
  { id:'tide_1983', label:'潮涌 1983', desc:'改革开放·国安初创', unlocked:false, color:'#3A5A7A' },
  { id:'invisible_2022', label:'无形 2022', desc:'数字时代·守护安全', unlocked:false, color:'#0A1628' },
  { id:'vigil_2026', label:'守望 2026', desc:'展望未来·共筑长城', unlocked:false, color:'#F8F8F0' },
]
</script>
```

---

## 七、首页与个人中心

### HomePage.vue

```vue
<template>
  <div style="width:375px;height:667px;background:linear-gradient(180deg,#0A1628,#1A2A4A);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#F5E6C8;">
    <div style="width:120px;height:120px;border-radius:50%;background:#D4B96A;display:flex;align-items:center;justify-content:center;font-size:40px;margin-bottom:20px;">
      🦅
    </div>
    <h1 style="font-size:24px;letter-spacing:4px;">密羽寻踪</h1>
    <p style="margin:20px 0;font-size:14px;opacity:0.8;">你是一粒种子，要在土里生根。</p>
    <button @click="startGame" style="padding:12px 48px;background:#8B6914;border:none;color:#FFF;font-size:16px;border-radius:8px;cursor:pointer;">
      {{ hasExistingSave ? '继续旅程' : '开始任务' }}
    </button>
    <button v-if="hasExistingSave" @click="resetGame" style="margin-top:12px;padding:8px 24px;background:transparent;border:1px solid #8B6914;color:#8B6914;border-radius:8px;cursor:pointer;">
      重新开始
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loadGame, deleteSave, hasSave } from '../engine/SaveManager'
const router = useRouter()
const hasExistingSave = ref(false)

onMounted(async () => {
  hasExistingSave.value = await hasSave()
})

async function startGame() {
  const loaded = await loadGame()
  if (loaded) router.push('/worlds')
  else router.push('/worlds')
}

async function resetGame() {
  await deleteSave()
  hasExistingSave.value = false
}
</script>
```

### ProfilePage.vue

```vue
<template>
  <div style="width:375px;min-height:667px;background:#1A1A1A;color:#F5E6C8;padding:20px;">
    <h2>👤 个人中心</h2>
    <div style="padding:16px;background:#2A2A2A;border-radius:8px;">
      <p>🦅 代号：渡鸦</p>
      <p>🪶 羽毛：{{ store.feathers }}</p>
      <p>📦 道具：{{ store.items.join(', ') || '无' }}</p>
      <p>🧩 碎片：{{ store.fragments.length }} 片</p>
    </div>
    <div style="margin-top:12px;padding:16px;background:#2A2A2A;border-radius:8px;">
      <p>📊 数值面板</p>
      <div v-for="(val, key) in store.stats" :key="key" style="margin:4px 0;font-size:13px;">
        {{ key }}：{{ val }}
      </div>
    </div>
    <div style="margin-top:12px;padding:16px;background:#2A2A2A;border-radius:8px;">
      <p>🏆 已解锁结局：{{ store.endingsUnlocked.join(', ') || '无' }}</p>
      <p>📖 已完成章节：{{ store.completedChapters.join(', ') || '无' }}</p>
    </div>
    <button @click="save" style="margin-top:16px;padding:8px 24px;">💾 手动存档</button>
    <button @click="$router.back()" style="margin-left:8px;padding:8px 24px;">← 返回</button>
    <p v-if="saveMsg" style="margin-top:8px;color:#4CAF50;">{{ saveMsg }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { saveGame } from '../engine/SaveManager'
const store = useGameStore()
const saveMsg = ref('')
async function save() {
  await saveGame()
  saveMsg.value = '✅ 已存档'
}
</script>
```

---

## 八、App.vue 入口

```vue
<template>
  <div id="app" style="max-width:375px;margin:0 auto;position:relative;">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useGameStore } from './stores/gameStore'
import { loadGame } from './engine/SaveManager'
onMounted(async () => {
  const store = useGameStore()
  await loadGame('auto')
})
</script>
```

### `src/main.ts`

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

---

## 九、验证检查清单

运行 `npm run dev` 后逐项打勾：

| # | 验证项 | 操作 | 预期 | ✓ |
|---|--------|------|------|---|
| 1 | 首页加载 | 访问 `/` | 显示情报鹰 + "开始任务"按钮 | ☐ |
| 2 | 存档检测 | 首次 vs 再次打开 | 首次显示"开始任务"，有存档显示"继续旅程" | ☐ |
| 3 | 世界选择 | 点击"开始任务" | 显示 7 个世界，仅淬火1937可点击 | ☐ |
| 4 | 地图显示 | 点击淬火1937 | 显示墨绿色背景 + POI 圆点 + 情报鹰文字标签 | ☐ |
| 5 | 地图模式切换 | 点击"自由探索/任务探索" | 按钮文字切换 | ☐ |
| 6 | 叙事引擎 | 点击某 POI 进入剧情页 | 显示场景占位 + 底部对话/选项 | ☐ |
| 7 | 对话推进 | 点击"继续 →" | 文本切换，显示数值变化提示 | ☐ |
| 8 | 选项分支 | 选择不同选项 | 跳转不同下一节点，数值变化 | ☐ |
| 9 | 条件判定 | 信念≥6 vs <6 | 触发不同结局（坚定/动摇） | ☐ |
| 10 | 多结局 | 走完剧本 | 显示结局描述 + 回到世界选择 | ☐ |
| 11 | 情报站 | 点击情报站 POI | 显示密码输入界面 | ☐ |
| 12 | 密码验证 | 输入 yljb | 显示"破译成功" + 加羽毛 | ☐ |
| 13 | 密码错误 | 输入其他 | 显示"密码错误" | ☐ |
| 14 | 题库入口 | 点击题库 POI | 显示题目列表 | ☐ |
| 15 | 答题 | 点击"答题" | 弹出 Modal，显示题目 | ☐ |
| 16 | 答对 | 选择正确答案 | 显示绿色 ✅ + 加羽毛 | ☐ |
| 17 | 答错 | 选择错误答案 | 显示红色 ❌ + 解析 | ☐ |
| 18 | 答错 3 次 | 同一题错 3 次 | 显示“本题暂时锁定”提示 | ☐ |
| 19 | 碎片收集 | 完成条件后查看碎片页面 | 对应碎片显示 ✅，可点开看详情 | ☐ |
| 20 | 碎片集齐 | 集齐 5 片 | 显示"全部集齐"合成提示 | ☐ |
| 21 | 商城 | 点击商城市集 POI | 显示商品列表 + 羽毛余额 | ☐ |
| 22 | 兑换 | 点击"兑换" | 羽毛扣减，道具加入背包 | ☐ |
| 23 | 余额不足 | 羽毛不够时点兑换 | 按钮灰色禁用或显示"不足" | ☐ |
| 24 | 个人中心 | 导航至 `/profile` | 显示数值、道具、羽毛、结局 | ☐ |
| 25 | 手动存档 | 点击"手动存档" | 显示"已存档" | ☐ |
| 26 | 读档 | 刷新页面 | 自动读取存档，状态保持 | ☐ |
| 27 | 重新开始 | 首页点击"重新开始" | 清除存档，回到初始 | ☐ |
| 28 | JSON 驱动 | 修改 demo.json 某节点内容 | 刷新后剧情内容变化 | ☐ |
| 29 | npm run build | 构建 | 输出 dist/ 纯静态目录 | ☐ |
| 30 | 静态部署运行 | 使用 `vite preview` 或任意 HTTP 静态服务器启动 `dist/` | 全部功能正常 | ☐ |

---

## 十、迭代建议

```
v0.1 (当前) → 文字占位，验证 H5 MVP 系统通路
v0.2        → 替换第一版美术资源（手绘地图、角色立绘）
v0.3        → 接入完整淬火1937剧本（约7回+序幕+终章）
v0.4        → 音效+BGM + GSAP 叙事动画
v0.5        → 浏览器真机兼容、性能与静态部署优化
后续待规划   → 视频、小程序壳、组队、打卡与实体交易
```

---

## 快速启动

```bash
# 1. 初始化
npm create vite@latest miyuxunzong-demo -- --template vue-ts
cd miyuxunzong-demo
npm install
npm install pixi.js@8 gsap howler vue-router@4 pinia idb-keyval

# 2. 按上述代码创建文件

# 3. 创建目录结构
mkdir -p public/data/scripts
mkdir -p src/engine src/stores src/views src/renderer src/router src/types

# 4. 放入 demo.json 到 public/data/scripts/

# 5. 运行
npm run dev
# → 浏览器打开 http://localhost:5173

# 6. 验证清单全部打勾后，进入 v0.2
```

> **文档版本**：v1.0 | **用途**：技术可行性验证原型搭建指南
