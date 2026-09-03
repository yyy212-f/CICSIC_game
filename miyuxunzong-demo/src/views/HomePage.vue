<template>
  <main class="home">
    <section class="home-visual"><div class="home-eagle">🦅</div><span>情报鹰 · 任务引导</span></section>
    <section class="home-content">
      <p class="eyebrow">沉浸式国家安全教育</p>
      <h1 class="title">密羽寻踪</h1>
      <p class="home-copy">从一段隐蔽战线的往事开始，完成你的情报任务。当前版本为横屏 H5 原型。注：仅用于demo验证！</p>
      <div class="actions">
        <button class="primary" @click="enterWorld">{{ hasExistingSave ? '继续旅程' : '开始任务' }}</button>
        <button v-if="hasExistingSave" @click="restart">重新开始</button>
      </div>
    </section>
  </main>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { deleteSave, hasSave, loadGame } from '../engine/SaveManager'
import { useGameStore } from '../stores/gameStore'
const router = useRouter(); const store = useGameStore(); const hasExistingSave = ref(false)
onMounted(async () => { hasExistingSave.value = await hasSave() })
async function enterWorld() { await loadGame('auto'); router.push('/worlds') }
async function restart() { await deleteSave(); store.resetGame(); hasExistingSave.value = false }
</script>
