import { useGameStore } from '../stores/gameStore'
import type { Script, Node, Choice } from '../types'

export class NarrativeEngine {
  private script: Script
  private chapterIdx = 0
  private sceneIdx = 0
  private nodeIdx = 0
  private store = useGameStore()

  constructor(script: Script) {
    this.script = script
  }

  get currentChapter() { return this.script.chapters[this.chapterIdx] }
  get currentScene() { return this.currentChapter?.scenes[this.sceneIdx] }
  get currentNode(): Node | null { return this.currentScene?.nodes[this.nodeIdx] ?? null }

  get scriptTitle() { return this.script.meta.title }
  get chapterTitle() { return this.currentChapter?.title || '' }
  get chapterProgress() { return `${this.chapterIdx + 1} / ${this.script.chapters.length}` }

  getAvailableChoices(): { choice: Choice; index: number }[] {
    const node = this.currentNode
    if (!node || node.type !== 'choice' || !node.choices) return []
    return node.choices
      .map((c, i) => ({ choice: c, index: i }))
      .filter(({ choice }) => {
        if (!choice.condition) return true
        return this.store.evaluateCondition({
          stat: choice.condition.stat,
          operator: choice.condition.operator,
          value: choice.condition.value,
        })
      })
  }

  async load(url: string) {
    const resp = await fetch(url)
    if (!resp.ok) throw new Error(`剧情数据加载失败（HTTP ${resp.status}）`)
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

  goToChapter(chapterId: string) {
    const ci = this.script.chapters.findIndex(c => c.id === chapterId)
    if (ci >= 0) {
      this.chapterIdx = ci
      this.sceneIdx = 0
      this.nodeIdx = 0
    }
  }

  getCurrentChapterId(): string {
    return this.currentChapter?.id || ''
  }

  isLastChapter(): boolean {
    return this.chapterIdx >= this.script.chapters.length - 1
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
