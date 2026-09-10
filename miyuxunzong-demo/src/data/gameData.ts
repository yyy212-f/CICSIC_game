import manifest from './scripts/tempered_1937/manifest.json'
import prologue from './scripts/tempered_1937/01_序幕-入党与离校.json'
import firstRound from './scripts/tempered_1937/02_第一回-烽火骤起.json'
import thirdRound from './scripts/tempered_1937/04_第三回-报名服务团.json'
import fourthRound from './scripts/tempered_1937/05_第四回-暗流试锋.json'
import secondRound from './scripts/tempered_1937/03_第二回-暗号初步.json'
import type { Node, Script } from '../types'

const chapterFiles = [prologue, firstRound, secondRound, thirdRound, fourthRound]
export const temperedScript = { ...manifest, chapters: chapterFiles } as Script

export const chapterLabels = temperedScript.chapters.map(chapter => ({
  id: chapter.id,
  title: chapter.title,
}))

export function findNode(nodeId: string): Node | null {
  for (const chapter of temperedScript.chapters) {
    for (const scene of chapter.scenes) {
      const node = scene.nodes.find(item => item.id === nodeId)
      if (node) return node
    }
  }
  return null
}

export function firstNodeForChapter(chapterId: string): Node | null {
  const chapter = temperedScript.chapters.find(item => item.id === chapterId)
  return chapter?.scenes[0]?.nodes[0] ?? null
}

export function chapterForNode(nodeId: string): string | null {
  for (const chapter of temperedScript.chapters) {
    if (chapter.scenes.some(scene => scene.nodes.some(node => node.id === nodeId))) return chapter.id
  }
  return null
}

export function sceneForNode(nodeId: string) {
  for (const chapter of temperedScript.chapters) {
    const scene = chapter.scenes.find(item => item.nodes.some(node => node.id === nodeId))
    if (scene) return scene
  }
  return null
}
