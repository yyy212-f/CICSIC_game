<template>
  <main class="page feature-page fragment-page">
    <header class="topbar">
      <div><p class="eyebrow">情报站 · 拼图档案</p><h1>情报碎片</h1></div>
      <button @click="router.back()">← 地图</button>
    </header>
    <p class="notice">羽毛：{{ store.feathers }} · 身份线索 {{ cluePrice }} 羽毛 / 英雄碎片 {{ price }} 羽毛</p>

    <section class="feature-grid">
      <!-- 身份鉴别案例 -->
      <article v-for="ic in identityCases" :key="ic.id" class="feature-card">
        <h2>{{ ic.name }} <small style="color:#aaa">({{ ic.free ? '免费直出' : `每条 ${ic.price ?? cluePrice} 羽毛` }})</small></h2>
        <p class="muted">{{ ic.title }} · 已收集 {{ collectedCount(ic) }} / {{ ic.clues.length }} 条线索</p>
        <div v-for="clue in ic.clues" :key="clue.id" class="inventory-row">
          <strong>{{ clue.label }}</strong>
          <span>{{ ic.free || store.fragments.includes(clue.id) ? clue.content : '未解锁线索' }}</span>
          <button v-if="!ic.free && !store.fragments.includes(clue.id)"
                  :disabled="store.feathers < (ic.price ?? cluePrice)"
                  @click="unlockIdentityClue(clue.id, ic.price ?? cluePrice)">兑换</button>
        </div>
        <button v-if="ic.free || identityComplete(ic)"
                class="primary"
                @click="router.push(`/identity/${ic.id}`)">进入身份鉴别</button>
      </article>

      <!-- 英雄碎片组 -->
      <article v-for="group in groups" :key="group.id" class="feature-card">
        <h2>{{ group.heroName }}</h2>
        <p class="muted">{{ group.source }}</p>
        <div v-for="fragment in group.fragments" :key="fragment.id" class="inventory-row">
          <strong>{{ fragment.order }}. {{ fragment.unlocked ? fragment.content : '未解锁碎片' }}</strong>
          <button v-if="!fragment.unlocked" :disabled="store.feathers<price" @click="unlock(fragment.id)">兑换</button>
        </div>
      </article>
    </section>
  </main>
</template>
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import source from '../../public/data/fragments/tempered_1937.json'
import { identityCases } from '../data/resourceData'
import { autoSave } from '../engine/SaveManager'

const router = useRouter()
const store = useGameStore()
const price = 10          // 英雄碎片价格
const cluePrice = 8       // 身份线索默认价格

// 进入页面时自动解锁所有免费案例的线索
onMounted(() => {
  identityCases.forEach(ic => {
    if (ic.free) {
      ic.clues.forEach(clue => store.addFragment(clue.id))
    }
  })
})

// 辅助函数：统计已收集线索数
function collectedCount(ic: typeof identityCases[number]) {
  return ic.clues.filter(c => ic.free || store.fragments.includes(c.id)).length
}
// 辅助函数：线索是否集齐
function identityComplete(ic: typeof identityCases[number]) {
  return ic.clues.every(c => ic.free || store.fragments.includes(c.id))
}

const groups = computed(() =>
  source.groups.map(group => ({
    ...group,
    fragments: group.fragments.map(fragment => ({
      ...fragment,
      unlocked: store.fragments.includes(fragment.id) || store.fragments.includes(group.id),
    })),
  }))
)

async function unlock(id: string) {
  if (store.feathers < price || store.fragments.includes(id)) return
  store.addFeathers(-price)
  store.addFragment(id)
  await autoSave()
}

async function unlockIdentityClue(id: string, cost: number) {
  if (store.feathers < cost || store.fragments.includes(id)) return
  store.addFeathers(-cost)
  store.addFragment(id)
  await autoSave()
}
</script>