import manifest from './scripts/tempered_1937/manifest.json'
import prologue from './scripts/tempered_1937/01_序幕-入党与离校.json'
import firstRound from './scripts/tempered_1937/02_第一回-烽火骤起.json'
import secondRound from './scripts/tempered_1937/03_第二回-暗号初步.json'
import type { Node, Script } from '../types'

const chapterFiles = [prologue, firstRound, secondRound,
  {
    id: 'chapter3', title: '第三回·报名服务团·伪装身份', scenes: [
      { id:'ch3_scene', bgLabel:'', nodes:[
        { id:'ch3_intro', type:'narration', content:'湖南青年战地服务团报名点人声嘈杂。报名表上的每一栏都可能成为审查你的证据。', nextNodeId:'ch3_choice' },
        { id:'ch3_choice', type:'choice', content:'你如何填写报名经历？', choices:[
          { text:'如实填写求学和救亡经历', effects:[{stat:'conviction',change:2}], inventoryChanges:{add:['service_badge']}, nextNodeId:'ch3_end' },
          { text:'删去敏感经历，只保留普通信息', effects:[{stat:'suspicion',change:-1}], inventoryChanges:{add:['service_badge']}, nextNodeId:'ch3_end' },
          { text:'夸大经历以争取关注', effects:[{stat:'suspicion',change:4}], nextNodeId:'ch3_fail' }
        ] },
        { id:'ch3_fail', type:'ending', endingType:'failure', failure:true, endingDescription:'言多必失。你的经历前后矛盾，报名审查未能通过。' },
        { id:'ch3_end', type:'ending', endingType:'chapter_complete', endingDescription:'你获得服务团团员证，正式踏上西北征途。' }
      ] }
    ]
  },
  {
    id: 'chapter4', title: '第四回·暗流试锋·西北征途', scenes: [
      { id:'chapter4_scene', bgLabel:'', nodes:[
        { id:'chapter4_intro', type:'narration', content:'列车向西北驶去。车厢里的每一次盘问，都是对你身份和判断力的考验。', nextNodeId:'chapter4_choice' },
        { id:'chapter4_choice', type:'choice', content:'面对陌生人的试探，你如何应对？', choices:[
          { text:'保持沉默，观察对方', effects:[{stat:'insight',change:2},{stat:'suspicion',change:-1}], nextNodeId:'chapter4_end' },
          { text:'用服务团身份自然应答', effects:[{stat:'trust_org',change:2}], nextNodeId:'chapter4_end' },
          { text:'反过来套问对方', effects:[{stat:'insight',change:3},{stat:'suspicion',change:3}], nextNodeId:'chapter4_end' }
        ] },
        { id:'chapter4_end', type:'ending', endingType:'chapter_complete', endingDescription:'你抵达西北办事处，第一章主线任务完成。' }
      ] }
    ]
  }
]
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
