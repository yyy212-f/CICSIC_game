<template>
    <main class="narrative">
        <button class="bag-btn bag-btn-floating" @click="router.push('/profile')">🎒 背包</button>
        <div v-if="resumePrompt" class="resume-overlay"><section class="resume-dialog"><h2>继续这段剧情？</h2><p>检测到本小节有未完成的进度。</p><div class="panel-actions"><button class="primary" @click="continueSaved">继续上次进度</button><button @click="restartFromBeginning">重新开始</button></div></section></div>
        <div v-if="characterCard" class="character-overlay"><section class="character-card"><button class="character-close" aria-label="关闭人物介绍" title="关闭" @click="characterCard = null">×</button><img v-if="characterPortrait" :src="characterPortrait" :alt="characterCard.name"><strong>{{ characterCard.name }}</strong><span>{{ characterCard.role }} · {{ characterCard.identity }}</span><p>{{ characterCard.summary }}</p></section></div>
        <section class="scene" :style="sceneStyle"><div class="scene-shade"></div><img v-if="sceneFigure" class="scene-figure" :class="`scene-figure--${sceneFigure.position}`" :src="sceneFigure.src" :alt="sceneFigure.name"><div class="scene-meta">{{ chapterTitle }}</div></section>
        <section class="narrative-panel">
            <template v-if="node">
                <div v-if="node.speaker" class="speaker">{{ node.speaker }}</div>
                <p v-if="node.type !== 'ending'" class="story">{{ engine.renderText(node.content || '') }}</p>

                <div v-if="node.type === 'choice'" class="choice-list"><button v-for="(choice, index) in availableChoices" :key="choice.text" :class="{ selected: index === selectedChoice }" @click="selectChoice(choice)">{{ index === selectedChoice ? '▶ ' : '' }}{{ choice.text }}</button></div>
                <div v-else-if="node.type === 'ending'" class="ending">{{ node.endingDescription }}</div>
                <div class="panel-actions">
                    <button v-if="canAdvance" class="primary" @click="advance">继续 →</button>
                    <button v-if="node.type === 'ending' && !isFailureEnding" class="primary" @click="finish">{{ nextChapter ? '进入下一节' : '完成并返回地图' }}</button>
                    <button v-if="node.type === 'ending' && isFailureEnding" class="primary" @click="retryChapter">重新开始本章</button>
                    <button v-if="node.type === 'ending' && isFailureEnding && store.items.includes('revive_card')" @click="revive">使用原地复活卡</button>
                    <button @click="router.push('/map/tempered_1937')">← 地图</button>
                </div>
            </template>
            <template v-else>
                <h2>剧情节点暂不可用</h2>
                <p class="muted">本节剧情已结束或正在整理中，请返回地图继续其他章节。</p>
                <button @click="router.push('/map/tempered_1937')">返回地图</button>
            </template>
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
    import { NarrativeEngine } from '../engine/NarrativeEngine'
    import { characterCards } from '../data/resourceData'

    const route = useRoute(); const router = useRouter(); const store = useGameStore()
    const engine = new NarrativeEngine(temperedScript)
    const nodeId = ref(''); const selectedChoice = ref(0)
    const characterCard = ref<typeof characterCards[number] | null>(null)
    const resumePrompt = ref(false)
    const pendingChapter = ref('')
    const pendingNode = ref('')
    const seenCharacters = new Set<string>()

    const node = computed(() => nodeId.value ? findNode(nodeId.value) : null)

    const characterPortrait = computed(() => {
        // card 文件夹图片映射（仅序幕角色有专属 card 图，第二回角色后续补充）
        const cardMap: Record<string, string> = {
            // 序幕已确定有 card 图的角色
            'jiang_nanxiang': 'jiangnanxiang.png',
            'zhang_shoutian': 'menwei.png',
            'su_wenbin': 'xiaomenkoubianyi.png',
            'zhang_huiru': 'zhangtongxue.png',
            'li_wanqing': 'litongxue.png',
            'chen_xiuzhen': 'funv.png',
            'wu_cuilian': 'xiaogonglaowu.png',
            'laosun_bianyi': 'laosun.png',
            'recruit_officer': 'junjing.png',
            'nv_xuesheng': 'nvxuesheng.png',
            'player': 'player.png',
            // 第二回角色后续补充 card 图
            // 'guo_jianen': 'xxx.png',
            // 'teahouse_waiter': 'xxx.png',
            // 'tail_man': 'xxx.png',
        }
        const file = characterCard.value ? cardMap[characterCard.value.id] : ''
        return file ? `${import.meta.env.BASE_URL}assets/card/${encodeURIComponent(file)}` : ''
    })

    const sceneFigure = computed(() => {
        const figure = node.value?.figure
        if (!figure) return null
        const file = `${figure.id}.png`
        const src = `${import.meta.env.BASE_URL}assets/figure/${encodeURIComponent(file)}`
        return { name: figure.id, position: 'right', src }
    })

    const chapterTitle = computed(() => temperedScript.chapters.find(c => c.id === chapterForNode(nodeId.value, String(route.params.chapterId)))?.title ?? '淬火 1937')
    const currentChapterId = computed(() => chapterForNode(nodeId.value, String(route.params.chapterId)) ?? String(route.params.chapterId))
    const nextChapter = computed(() => {
        const index = temperedScript.chapters.findIndex(chapter => chapter.id === currentChapterId.value)
        return index >= 0 ? temperedScript.chapters[index + 1] : undefined
    })

    const sceneStyle = computed(() => {
        const bgLabel = sceneForNode(nodeId.value, String(route.params.chapterId))?.bgLabel
        if (!bgLabel) return {}
        const extension = ['scene0_Marx', 'scene0_dormitory'].includes(bgLabel) ? 'jpg' : 'png'
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
    const canAdvance = computed(() => !characterCard.value && ['dialogue', 'narration', 'action', 'condition'].includes(node.value?.type ?? ''))
    // 失败结局判定（用最直白的方式避免误判）
    // 规则：
    //   1. 不是 ending 类型 → 不是结局 → 返回 false
    //   2. failure 字段显式 true → 失败
    //   3. endingType 包含失败关键词 → 失败
    //   4. endingType 包含 complete → 通关（白名单兜底）
    //   5. 其余 → 默认通关
    const isFailureEnding = computed(() => {
        const n = node.value
        if (!n || n.type !== 'ending') return false
        if (n.failure === true) return true
        const t = (n.endingType || '').toLowerCase()
        // 失败关键词
        const failKws = ['caught', 'failure', 'chapter_fail', 'game_over', 'fail_']
        for (const kw of failKws) if (t.includes(kw)) return true
        return false
    })

    // 【关键1】路由参数变化时初始化 nodeId（页面加载时设置第一个剧情节点）
    watch(() => [route.params.chapterId, route.params.sceneId], params => {
        seenCharacters.clear()
        const id = String(params[0])
        const requestedNode = typeof params[1] === 'string' ? params[1] : ''
        const first = firstNodeForChapter(id)?.id || ''
        const savedBelongsToChapter = !!store.currentNodeId && chapterForNode(store.currentNodeId, id) === id
        const saved = !requestedNode && store.currentChapter === id && savedBelongsToChapter && store.currentNodeId !== first && !store.completedChapters.includes(id) ? store.currentNodeId : ''
        if (saved) {
            pendingChapter.value = id
            pendingNode.value = saved
            nodeId.value = first
            resumePrompt.value = true
        } else {
            store.clearChapterRuntimeItems(id)
            nodeId.value = requestedNode || first
            store.setProgress(id, nodeId.value)
        }
        selectedChoice.value = 0
    }, { immediate: true })

    // 节点变化时：人物卡片、进度保存、condition 自动跳转 
    watch(node, value => {
        const speakerMap: Record<string, string> = {
            // 序幕角色
            '蒋南翔': 'jiang_nanxiang',
            '校工老吴': 'wu_cuilian', '老吴（校工）': 'wu_cuilian', '老吴': 'wu_cuilian',
            '张同学': 'zhang_huiru',
            '室友李': 'li_wanqing',
            '门卫': 'zhang_shoutian',
            '带孩子的妇女': 'chen_xiuzhen',
            '老孙（便衣特务）': 'laosun_bianyi',
            '军警': 'recruit_officer',
            '女学生': 'nv_xuesheng',
            // 第二回角色
            '郭见恩': 'guo_jianen',
            '店小二': 'teahouse_waiter',
            '戴礼帽的男人': 'tail_man',
        }
        // 匹配来源：node.characterId > speaker 映射 > figure.id
        const fromSpeaker = value?.speaker ? speakerMap[value.speaker] : ''
        const fromFigure = value?.figure?.id || ''
        const characterId = value?.characterId || fromSpeaker || fromFigure
        // 去重：既要跳过内存中已见过的，也要跳过存档中已解锁的（防止 explore 重复弹出）
        if (characterId && !seenCharacters.has(characterId) && !store.unlockedCharacters.includes(characterId)) {
            seenCharacters.add(characterId)
            store.unlockCharacter(characterId)
            characterCard.value = characterCards.find(card => card.id === characterId) ?? null
        } else if (characterId) {
            seenCharacters.add(characterId) // 即使存档里有，也标记本次已见过
        }
        if (value) store.setProgress(chapterForNode(value.id, String(route.params.chapterId)) ?? String(route.params.chapterId), value.id)
    })

    // 应用效果（背后计算，不显示给用户）
    function applyEffects(effects?: Node['effects']) {
        if (!effects?.length) return
        store.applyEffects(effects)
    }

    // 跳转节点（condition 节点自动跳过，不显示空白页）
    function moveToNode(nextId: string | undefined) {
        if (!nextId || !findNode(nextId)) { nodeId.value = ''; return }
        nodeId.value = nextId
        const next = findNode(nextId)
        if (next?.type === 'condition' && next.condition) {
            setTimeout(() => {
                const pass = store.evaluateCondition(next.condition!)
                const target = pass ? next.condition!.passNodeId : next.condition!.failNodeId
                if (target) nodeId.value = target
            }, 50)
        }
    }

    function applyInventoryChanges(changes?: Node['inventoryChanges']) {
        if (!changes) return
        changes.add?.forEach(id => store.addItem(id))
        changes.remove?.forEach(id => store.removeItem(id))
    }

    function advance() {
        // 人物卡片弹出时禁止继续，必须先关掉
        if (characterCard.value) return
        const current = node.value
        if (!current) return
        if (current.type === 'condition' && current.condition) {
            moveToNode(store.evaluateCondition(current.condition) ? current.condition.passNodeId : current.condition.failNodeId)
        } else {
            applyEffects(current.effects)
            applyInventoryChanges(current.inventoryChanges)
            moveToNode(current.nextNodeId)
        }
        selectedChoice.value = 0
        void autoSave()
    }

    function selectChoice(choice: Choice) {
        store.setRetryNode(node.value?.id ?? '')
        applyEffects(choice.effects)
        applyInventoryChanges(choice.inventoryChanges)
        moveToNode(choice.nextNodeId)
        selectedChoice.value = 0
        void autoSave()
    }

    function finish() {
        const chapter = chapterForNode(nodeId.value, String(route.params.chapterId))
        if (chapter) {
            store.completeChapter(chapter)
            // 直接从 manifest 顺序找下一章，不依赖 computed
            const allIds = temperedScript.chapters.map(c => c.id)
            const currentIdx = allIds.indexOf(chapter)
            const nextId = currentIdx >= 0 ? allIds[currentIdx + 1] : undefined
            void autoSave()
            // 延迟一帧确保 store 状态同步后守卫能读到新值
            setTimeout(() => {
                if (nextId) router.push(`/narrative/${nextId}`)
                else router.push('/map/tempered_1937')
            }, 30)
        } else {
            void autoSave()
            router.push('/map/tempered_1937')
        }
    }

    function retryChapter() {
        const chapter = chapterForNode(nodeId.value, String(route.params.chapterId)) ?? String(route.params.chapterId)
        const first = firstNodeForChapter(chapter)?.id ?? ''
        nodeId.value = first
        store.setProgress(chapter, first)
        void autoSave()
    }

    function revive() {
        const chapter = chapterForNode(nodeId.value, String(route.params.chapterId)) ?? String(route.params.chapterId)
        const retryNode = store.retryNodeId
        const target = retryNode && chapterForNode(retryNode) === chapter ? retryNode : store.chapterCheckpoints[chapter] ?? firstNodeForChapter(chapter)?.id ?? ''
        if (store.useItem('revive_card')) {
            nodeId.value = target
            store.setProgress(chapter, target)
            void autoSave()
        }
    }

    function continueSaved() {
        nodeId.value = pendingNode.value
        store.setProgress(pendingChapter.value, pendingNode.value)
        resumePrompt.value = false
    }

    function restartFromBeginning() {
        const first = firstNodeForChapter(pendingChapter.value)?.id ?? ''
        nodeId.value = first
        store.setProgress(pendingChapter.value, first)
        resumePrompt.value = false
        void autoSave()
    }

    function onKeydown(event: KeyboardEvent) {
        // 人物卡片弹出时屏蔽所有剧情推进按键，Esc 关闭卡片
        if (characterCard.value) {
            if (event.key === 'Escape') characterCard.value = null
            return
        }
        const choices = availableChoices.value
        const isConfirm = event.key === 'Enter' || event.key === 'ArrowRight'
        if (node.value?.type === 'choice' && choices.length) {
            // choice 节点：右箭头用于切换选项（保留原有行为），Enter 确认选择
            if (event.key === 'ArrowDown' || event.key === 'ArrowRight') { event.preventDefault(); selectedChoice.value = (selectedChoice.value + 1) % choices.length }
            else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') { event.preventDefault(); selectedChoice.value = (selectedChoice.value - 1 + choices.length) % choices.length }
            else if (event.key === 'Enter') { event.preventDefault(); selectChoice(choices[selectedChoice.value]) }
        } else if (event.key === 'Escape') {
            router.push('/map/tempered_1937')
        } else if (isConfirm) {
            event.preventDefault()
            const n = node.value
            if (!n) return
            if (canAdvance.value) advance()
            else if (n.type === 'ending') {
                if (!isFailureEnding.value) finish()
                else retryChapter()
            }
        }
    }

    onMounted(() => window.addEventListener('keydown', onKeydown))
    onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>