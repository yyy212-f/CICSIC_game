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
  const currentNodeId = ref('')
  const chapterCheckpoints = ref<Record<string, string>>({})
  const unlockedCharacters = ref<string[]>([])
  const dailyQuizDate = ref('')
  const quizRecords = ref<Record<string,{wrongAttempts:number;passed:boolean}>>({})
  const exploreUntil = ref(0)
  const retryNodeId = ref('')

  const conviction = computed(() => stats.value.conviction)
  const suspicion = computed(() => stats.value.suspicion)
  const hasExploreAccess = computed(() => exploreUntil.value > Date.now())

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
  function unlockCharacter(id: string) { if (!unlockedCharacters.value.includes(id)) unlockedCharacters.value.push(id) }
  function setProgress(chapterId: string, nodeId: string) {
    currentChapter.value = chapterId; currentNodeId.value = nodeId
    if (!chapterCheckpoints.value[chapterId]) chapterCheckpoints.value[chapterId] = nodeId
  }
  function setChapterCheckpoint(chapterId: string, nodeId: string) { chapterCheckpoints.value[chapterId] = nodeId }
  function startExploreHour() { exploreUntil.value = Date.now() + 60 * 60 * 1000 }
  function setRetryNode(nodeId: string) { retryNodeId.value = nodeId }
  function useItem(id: string): boolean {
    if (!items.value.includes(id)) return false
    if (id === 'rebound_card') {
      if (stats.value.suspicion < 10) return false
      stats.value.suspicion = Math.max(0, stats.value.suspicion - 5)
    }
    else if (id === 'revive_card') { removeItem(id); return true }
    else if (id === 'explore_card') startExploreHour()
    else return false
    removeItem(id); return true
  }

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
      progress: { currentChapter: currentChapter.value, currentNodeId: currentNodeId.value, completedChapters: [...completedChapters.value], chapterCheckpoints: { ...chapterCheckpoints.value } },
      quiz: { ...quizRecords.value },
      collectibles: { fragments: [...fragments.value], fragmentGroups: {} },
      metadata: { playTime: 0, endingsUnlocked: [...endingsUnlocked.value], unlockedCharacters: [...unlockedCharacters.value], dailyQuizDate: dailyQuizDate.value, exploreUntil: exploreUntil.value, retryNodeId: retryNodeId.value },
    }
  }

  function loadSave(data: SaveData) {
    stats.value = { ...data.stats }
    feathers.value = data.inventory.feathers
    items.value = [...data.inventory.items]
    fragments.value = [...data.collectibles.fragments]
    completedChapters.value = [...data.progress.completedChapters]
    currentChapter.value = data.progress.currentChapter || ''
    currentNodeId.value = data.progress.currentNodeId || ''
    chapterCheckpoints.value = { ...(data.progress.chapterCheckpoints || {}) }
    endingsUnlocked.value = [...data.metadata.endingsUnlocked]
    unlockedCharacters.value = [...(data.metadata.unlockedCharacters || [])]
    dailyQuizDate.value = data.metadata.dailyQuizDate || ''
    exploreUntil.value = data.metadata.exploreUntil || 0
    retryNodeId.value = data.metadata.retryNodeId || ''
    quizRecords.value = { ...data.quiz }
  }

  function resetGame() {
    stats.value = { suspicion:0, insight:3, conviction:5, trust_father:0, trust_org:0, worry:0 }
    feathers.value = 0
    items.value = []
    fragments.value = []
    endingsUnlocked.value = []
    completedChapters.value = []
    currentChapter.value = ''
    currentScene.value = ''
    currentNode.value = null
    currentNodeId.value = ''
    chapterCheckpoints.value = {}
    unlockedCharacters.value = []
    dailyQuizDate.value = ''
    exploreUntil.value = 0
    retryNodeId.value = ''
    quizRecords.value = {}
  }

  return {
    stats, feathers, items, fragments, endingsUnlocked, completedChapters,
    currentChapter, currentScene, currentNode, currentNodeId, chapterCheckpoints, unlockedCharacters, dailyQuizDate, quizRecords, exploreUntil, retryNodeId,
    conviction, suspicion, hasExploreAccess,
    applyEffects, addItem, removeItem, addFeathers, addFragment,
    unlockEnding, completeChapter, unlockCharacter, setProgress, setChapterCheckpoint, setRetryNode, startExploreHour, useItem, evaluateCondition, toSaveData, loadSave, resetGame,
  }
})
