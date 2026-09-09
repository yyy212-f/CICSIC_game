<template>
  <main class="page feature-page">
    <header class="topbar"><div><p class="eyebrow">情报站 · 身份鉴别样例</p><h1>{{ identityCase.name }}</h1></div><button @click="router.push('/fragments/tempered_1937')">← 情报碎片</button></header>
    <section class="feature-card identity-file">
      <p class="muted">{{ identityCase.title }} · 已收集 {{ collectedClues.length }} / {{ identityCase.clues.length }} 条线索</p>
      <div v-for="clue in collectedClues" :key="clue.id" class="inventory-row"><strong>{{ clue.label }}</strong><span>{{ clue.content }}</span></div>
      <template v-if="isComplete">
        <h2>身份判别</h2>
        <div class="choice-list"><button v-for="option in options" :key="option" :class="{ selected: selected === option }" @click="selected = option">{{ option }}</button></div>
        <button class="primary" :disabled="!selected || passed" @click="judge">提交判定</button>
        <p v-if="result" class="notice">{{ result }}</p>
      </template>
      <p v-else class="notice">线索尚未集齐，无法作出身份判别。</p>
    </section>
  </main>
</template>
<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { identityCases } from '../data/resourceData'
import { useGameStore } from '../stores/gameStore'
import { autoSave } from '../engine/SaveManager'

const router = useRouter()
const route = useRoute()
const store = useGameStore()

// 通过路由参数 caseId 查找对应案例，兼容没有参数的情况
const identityCase = computed(() => {
  const caseId = route.params.caseId as string
  return identityCases.find(c => c.id === caseId) ?? identityCases[0]
})

// 如果案例是免费的，进入页面时确保线索已自动解锁
onMounted(() => {
  const ic = identityCase.value
  if (ic?.free) {
    ic.clues.forEach(c => store.addFragment(c.id))
  }
})
const options = ['平民', '我方潜伏人员', '国民党特务']
const selected = ref('')
const result = ref('')
const passed = computed(() => store.fragments.includes(`identity:${identityCase.value.id}:passed`))
const collectedClues = computed(() => {
  const ic = identityCase.value
  return ic.clues.filter(clue => ic.free || store.fragments.includes(clue.id))
})
const isComplete = computed(() => collectedClues.value.length === identityCase.value.clues.length)
async function judge() {
  const ic = identityCase.value
  if (selected.value === ic.answer) {
    store.addFragment(`identity:${ic.id}:passed`)
    store.unlockCharacter(ic.id)
    result.value = `判定正确：${ic.explanation}`
    await autoSave()
  } else result.value = '判定不正确。请重新核对已收集线索之间是否存在矛盾。'
}
</script>