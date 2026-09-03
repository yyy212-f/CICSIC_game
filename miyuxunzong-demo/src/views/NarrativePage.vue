<template>
  <main class="narrative">
    <div v-if="resumePrompt" class="resume-overlay"><section class="resume-dialog"><h2>继续这段剧情？</h2><p>检测到本小节有未完成的进度。</p><div class="panel-actions"><button class="primary" @click="continueSaved">继续上次进度</button><button @click="restartFromBeginning">重新开始</button></div></section></div>
    <div v-if="characterCard" class="character-overlay"><section class="character-card"><button class="character-close" aria-label="关闭人物介绍" title="关闭" @click="characterCard = null">×</button><img v-if="characterPortrait" :src="characterPortrait" :alt="characterCard.name"><strong>{{ characterCard.name }}</strong><span>{{ characterCard.role }} · {{ characterCard.identity }}</span><p>{{ characterCard.summary }}</p></section></div>
    <section class="scene" :style="sceneStyle"><div class="scene-shade"></div><img v-if="sceneFigure" class="scene-figure" :class="`scene-figure--${sceneFigure.position}`" :src="sceneFigure.src" :alt="sceneFigure.name"><div class="scene-meta">{{ chapterTitle }}</div></section>
    <section class="narrative-panel">
      <template v-if="node">
        <div v-if="node.speaker" class="speaker">{{ node.speaker }}</div>
        <p v-if="node.type !== 'ending'" class="story">{{ node.content }}</p>
        <div v-if="node.type === 'choice'" class="choice-list"><button v-for="(choice, index) in availableChoices" :key="choice.text" :class="{ selected: index === selectedChoice }" @click="selectChoice(choice)">{{ index === selectedChoice ? '▶ ' : '' }}{{ choice.text }}</button></div>
        <div v-else-if="node.type === 'ending'" class="ending">{{ node.endingDescription }}</div>
        <p v-if="effectMessage" class="stat-line">{{ effectMessage }}</p>
        <div class="panel-actions">
          <button v-if="canAdvance" class="primary" @click="advance">继续 →</button>
          <button v-if="node.type === 'ending' && !node.failure" class="primary" @click="finish">{{ nextChapter ? '进入下一节' : '完成并返回地图' }}</button>
          <button v-if="node.type === 'ending' && node.failure" class="primary" @click="retryChapter">重新开始本章</button>
          <button v-if="node.type === 'ending' && node.failure && store.items.includes('revive_card')" @click="revive">使用原地复活卡</button>
          <button @click="router.push('/map/tempered_1937')">← 地图</button>
        </div>
      </template>
      <template v-else><h2>剧情节点暂不可用</h2><p class="muted">本节剧情已结束或正在整理中，请返回地图继续其他章节。</p><button @click="router.push('/map/tempered_1937')">返回地图</button></template>
    </section>
  </main>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { chapterForNode, findNode, firstNodeForChapter, sceneForNode, temperedScript } from '../data/gameData'
import type { Choice, Node } from '../types'
import { useGameStore } from '../stores/gameStore'
import { autoSave } from '../engine/SaveManager'
import { characterCards } from '../data/resourceData'
const route = useRoute(); const router = useRouter(); const store = useGameStore()
const nodeId = ref(''); const effectMessage = ref(''); const selectedChoice = ref(0)
const characterCard = ref<typeof characterCards[number] | null>(null)
const resumePrompt = ref(false)
const pendingChapter = ref('')
const pendingNode = ref('')
const seenCharacters = new Set<string>()
const node = computed(() => nodeId.value ? findNode(nodeId.value) : null)
const characterPortrait = computed(() => { const nameMap: Record<string, string> = { 'jiang_nanxiang':'蒋南翔.jpg', 'wu_cuilian':'校工老吴.jpg', 'su_wenbin':'张同学.jpg', 'zhang_shoutian':'门卫.jpg' }; const file = characterCard.value ? nameMap[characterCard.value.id] : ''; return file ? `${import.meta.env.BASE_URL}assets/figure/${encodeURIComponent(file)}` : '' })
const sceneFigure = computed(() => {
  const figure = node.value?.figure
  if (!figure || figure.id !== 'jiang_nanxiang') return null
  return { name: '蒋南翔', position: figure.position ?? 'center', src: `${import.meta.env.BASE_URL}assets/figure/${encodeURIComponent('蒋南翔_透明.png')}` }
})
const chapterTitle = computed(() => temperedScript.chapters.find(c => c.id === chapterForNode(nodeId.value))?.title ?? '淬火 1937')
const currentChapterId = computed(() => chapterForNode(nodeId.value) ?? String(route.params.chapterId))
const nextChapter = computed(() => { const index = temperedScript.chapters.findIndex(chapter => chapter.id === currentChapterId.value); return index >= 0 ? temperedScript.chapters[index + 1] : undefined })
const sceneStyle = computed(() => {
  const bgLabel = sceneForNode(nodeId.value)?.bgLabel
  if (!bgLabel) return {}
  const extension = ['scene0_Marx', 'scene0_dormitory'].includes(bgLabel) ? 'jpg' : 'png'
  // Resolve from the document location, excluding the hash route, so CSS always
  // receives an absolute asset URL on static hosts such as GitHub Pages.
  const pageUrl = window.location.href.split('#', 1)[0]
  const assetUrl = new URL(`${import.meta.env.BASE_URL}assets/backgrounds/${bgLabel}.${extension}`, pageUrl).href
  return {
    backgroundImage: `url("${assetUrl}")`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  }
})
const availableChoices = computed(() => (node.value?.choices ?? []).filter(choice => !choice.condition || store.evaluateCondition(choice.condition)))
const canAdvance = computed(() => ['dialogue','narration','action','condition'].includes(node.value?.type ?? ''))
watch(() => [route.params.chapterId, route.params.sceneId], params => { seenCharacters.clear(); const id = String(params[0]); const requestedNode = typeof params[1] === 'string' ? params[1] : ''; const first = firstNodeForChapter(id)?.id || ''; const savedBelongsToChapter = !!store.currentNodeId && chapterForNode(store.currentNodeId) === id; const saved = !requestedNode && store.currentChapter === id && savedBelongsToChapter && store.currentNodeId !== first && !store.completedChapters.includes(id) ? store.currentNodeId : ''; if (saved) { pendingChapter.value = id; pendingNode.value = saved; nodeId.value = first; resumePrompt.value = true } else { nodeId.value = requestedNode || first; store.setProgress(id, nodeId.value) }; effectMessage.value = ''; selectedChoice.value = 0 }, { immediate: true })
watch(node, value => { const speakerMap: Record<string, string> = { '蒋南翔':'jiang_nanxiang', '老吴（校工）':'wu_cuilian', '老吴':'wu_cuilian', '父亲':'zhang_shoutian', '母亲':'li_wanqing', '张同学':'su_wenbin' }; const characterId = value?.characterId || (value?.speaker ? speakerMap[value.speaker] : ''); if (characterId && !seenCharacters.has(characterId)) { seenCharacters.add(characterId); store.unlockCharacter(characterId); characterCard.value = characterCards.find(card => card.id === characterId) ?? null } if (value) store.setProgress(chapterForNode(value.id) ?? String(route.params.chapterId), value.id) })
function applyEffects(effects?: Node['effects']) { if (!effects?.length) return; store.applyEffects(effects); effectMessage.value = effects.map(item => `${item.stat} ${item.change >= 0 ? '+' : ''}${item.change}`).join(' · ') }
function moveToNode(nextId: string | undefined) { if (!nextId || !findNode(nextId)) { nodeId.value = ''; return } nodeId.value = nextId }
function advance() { const current = node.value; if (!current) return; if (current.type === 'condition' && current.condition) moveToNode(store.evaluateCondition(current.condition) ? current.condition.passNodeId : current.condition.failNodeId); else { applyEffects(current.effects); moveToNode(current.nextNodeId) }; selectedChoice.value = 0; void autoSave() }
function selectChoice(choice: Choice) { store.setRetryNode(node.value?.id ?? ''); applyEffects(choice.effects); moveToNode(choice.nextNodeId); selectedChoice.value = 0; void autoSave() }
function finish() { const chapter = chapterForNode(nodeId.value); if (chapter) store.completeChapter(chapter); void autoSave(); if (nextChapter.value) router.push(`/narrative/${nextChapter.value.id}`); else router.push('/map/tempered_1937') }
function retryChapter() { const chapter = chapterForNode(nodeId.value) ?? String(route.params.chapterId); const first = firstNodeForChapter(chapter)?.id ?? ''; nodeId.value = first; store.setProgress(chapter, first); void autoSave() }
function revive() { const chapter = chapterForNode(nodeId.value) ?? String(route.params.chapterId); const retryNode = store.retryNodeId; const target = retryNode && chapterForNode(retryNode) === chapter ? retryNode : store.chapterCheckpoints[chapter] ?? firstNodeForChapter(chapter)?.id ?? ''; if (store.useItem('revive_card')) { nodeId.value = target; store.setProgress(chapter, target); void autoSave() } }
function continueSaved() { nodeId.value = pendingNode.value; store.setProgress(pendingChapter.value, pendingNode.value); resumePrompt.value = false }
function restartFromBeginning() { const first = firstNodeForChapter(pendingChapter.value)?.id ?? ''; nodeId.value = first; store.setProgress(pendingChapter.value, first); resumePrompt.value = false; void autoSave() }
function onKeydown(event: KeyboardEvent) { const choices = availableChoices.value; if (node.value?.type === 'choice' && choices.length) { if (event.key === 'ArrowDown' || event.key === 'ArrowRight') { event.preventDefault(); selectedChoice.value = (selectedChoice.value + 1) % choices.length } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') { event.preventDefault(); selectedChoice.value = (selectedChoice.value - 1 + choices.length) % choices.length } else if (event.key === 'Enter') { event.preventDefault(); selectChoice(choices[selectedChoice.value]) } } else if (event.key === 'Enter' && canAdvance.value) { event.preventDefault(); advance() } else if (event.key === 'Escape') router.push('/map/tempered_1937') }
onMounted(() => window.addEventListener('keydown', onKeydown)); onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>
