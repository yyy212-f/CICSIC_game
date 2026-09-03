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
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { identityCases } from '../data/resourceData'
import { useGameStore } from '../stores/gameStore'
import { autoSave } from '../engine/SaveManager'

const router = useRouter()
const store = useGameStore()
const identityCase = identityCases[0]
const options = ['平民', '我方潜伏人员', '国民党特务']
const selected = ref('')
const result = ref('')
const passed = computed(() => store.fragments.includes(`identity:${identityCase.id}:passed`))
const collectedClues = computed(() => identityCase.clues.filter(clue => store.fragments.includes(clue.id)))
const isComplete = computed(() => collectedClues.value.length === identityCase.clues.length)
async function judge() {
  if (selected.value === identityCase.answer) {
    store.addFragment(`identity:${identityCase.id}:passed`)
    store.unlockCharacter(identityCase.id)
    result.value = `判定正确：${identityCase.explanation}`
    await autoSave()
  } else result.value = '判定不正确。请重新核对已收集线索之间是否存在矛盾。'
}
</script>
