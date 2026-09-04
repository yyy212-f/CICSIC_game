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
    /**
 * 渲染文本，将 {字段名} 替换为真实属性值
 * 支持：{suspicion} {insight} {conviction} {trust_father} {trust_org} {worry} {inventory} {status_tags}
 */
    renderText(text: string): string {
        // 状态标记物品 -> 中文显示 的映射表
        const tagMap: Record<string, string> = {
            'tag_burned_book': '烧书被校工留意',
            'tag_gave_book': '赠书达成默契',
            'tag_rewrapped_book': '改书皮室友起疑',
        }
        return text.replace(/\{(\w+)\}/g, (match, key: string) => {
            // 属性值替换
            const statVal = (this.store.stats as Record<string, number>)[key]
            if (statVal !== undefined) return String(statVal)
            // 背包道具列表
            if (key === 'inventory') {
                const realItems = this.store.items.filter(i => !i.startsWith('tag_'))
                return realItems.length > 0 ? realItems.join('、') : '无'
            }
            // 状态标记列表（自动扫描 tag_ 开头的物品，转换成中文）
            if (key === 'status_tags') {
                const tags = this.store.items
                    .filter(i => i.startsWith('tag_'))
                    .map(i => tagMap[i] || i)
                return tags.length > 0 ? tags.join(' / ') : '无'
            }
            // 羽毛数量
            if (key === 'feathers') return String(this.store.feathers)
            // 不认识的变量，原样返回
            return match
        })
    }


}
