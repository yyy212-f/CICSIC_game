<template><main class="page feature-page"><header class="topbar"><div><p class="eyebrow">个人档案 · 背包</p><h1>渡鸦</h1></div><button @click="router.back()">← 返回</button></header><section class="feature-grid"><article class="feature-card"><h2>资源</h2><p>羽毛：{{ store.feathers }}</p><p>已完成：{{ store.completedChapters.length }} 章</p><p>结局：{{ store.endingsUnlocked.join('、') || '无' }}</p><p>持有道具：{{ uniqueItems.length }} 种 / 共 {{ store.items.length }} 件</p></article><article class="feature-card bag-section"><h2>道具（{{ uniqueItems.length }}）</h2><div v-if="!uniqueItems.length" class="muted">背包空空如也，快去探索或到商城兑换吧。</div><div v-else class="bag-grid"><article v-for="bagItem in uniqueItems" :key="bagItem.id" class="shop-card bag-card"><div class="shop-thumb"><img v-if="bagItem.image" :src="bagItem.image" :alt="bagItem.name" /><span v-else-if="bagItem.emoji" class="shop-emoji">{{ bagItem.emoji }}</span><span v-else class="shop-emoji">📦</span></div><div class="shop-info"><h2>{{ bagItem.name }}</h2><span v-if="bagItem.quantity > 1" class="shop-price">× {{ bagItem.quantity }}</span></div><p class="shop-desc">{{ bagItem.description }}</p><p v-if="bagItem.detail && bagItem.detail !== '无'" class="shop-detail">{{ bagItem.detail }}</p><div class="bag-actions"><button v-if="bagItem.id === 'rebound_card'" :disabled="store.suspicion < 10" @click="useRebound">{{ store.suspicion >= 10 ? '使用（怀疑值 -5）' : '需怀疑值 ≥ 10' }}</button><button v-if="bagItem.id === 'explore_card'" :disabled="store.hasExploreAccess" @click="useExplore">{{ store.hasExploreAccess ? '生效中…' : '使用（开启 1 小时）' }}</button></div></article></div></article><article class="feature-card"><h2>人物名片</h2><button v-for="card in characterCards.filter(card => store.unlockedCharacters.includes(card.id))" :key="card.id" class="inventory-row inventory-button" @click="selectedCard = card"><strong>{{ card.name }} · {{ card.identity }}</strong><span>{{ card.role }}</span></button><p v-if="!store.unlockedCharacters.length" class="muted">完成剧情后解锁</p></article><article class="feature-card"><h2>数值</h2><p v-for="(value,key) in store.stats" :key="key">{{ key }}：{{ value }}</p><button class="primary" @click="save">手动存档</button><p v-if="message" class="notice">{{ message }}</p></article></section><div v-if="selectedCard" class="character-overlay" @click.self="selectedCard = null"><section class="character-card"><button class="character-close" aria-label="关闭人物名片" title="关闭" @click="selectedCard = null">×</button><img v-if="selectedPortrait" :src="selectedPortrait" :alt="selectedCard.name"><strong>{{ selectedCard.name }}</strong><span>{{ selectedCard.role }} · {{ selectedCard.identity }}</span><p v-if="selectedCard.age || selectedCard.origin">{{ selectedCard.age }} · {{ selectedCard.origin }}</p><p>{{ selectedCard.summary }}</p><ul><li v-for="clue in selectedCard.clues" :key="clue">{{ clue }}</li></ul></section></div></main></template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import { autoSave, saveGame } from '../engine/SaveManager'
import { characterCards, itemCatalog } from '../data/resourceData'
import type { CharacterCard } from '../types'
import type { ShopItem } from '../data/resourceData'

const router = useRouter()
const store = useGameStore()
const message = ref('')
const selectedCard = ref<CharacterCard | null>(null)

// ID 归一化：把 silver_10 / silver_8 / silver_5 / silver_2 统一成 silver，dryfood_数字 统一成 dryfood
function normalizeId(id: string): string {
  if (/^silver_\d+$/.test(id)) return 'silver'
  if (/^dryfood_\d+$/.test(id)) return 'dryfood'
  return id
}

// 去重后的背包物品列表（附带数量）
const uniqueItems = computed(() => {
  const seen = new Map<string, number>()
  store.items.forEach(rawId => {
    const id = normalizeId(rawId)
    seen.set(id, (seen.get(id) ?? 0) + 1)
  })
  return [...seen.entries()]
    .map(([id, quantity]) => {
      const catalog = itemCatalog.find(c => c.id === id)
      return { id, quantity, ...(catalog ?? { name: id, description: '（未知物品）' }) } as ShopItem & { quantity: number }
    })
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
})

const selectedPortrait = computed(() => {
  const file = selectedCard.value?.id === 'jiang_nanxiang' ? '蒋南翔.jpg'
    : selectedCard.value?.id === 'wu_cuilian' ? '校工老吴.jpg'
    : selectedCard.value?.id === 'su_wenbin' ? '张同学.jpg'
    : selectedCard.value?.id === 'zhang_shoutian' ? '门卫.jpg'
    : ''
  return file ? `${import.meta.env.BASE_URL}assets/figure/${encodeURIComponent(file)}` : ''
})

async function save() { await saveGame(); message.value = '存档完成' }
async function useRebound() { if (store.useItem('rebound_card')) { message.value = '触底反弹卡已使用，怀疑值降低 5 点'; await autoSave() } }
async function useExplore() { if (store.useItem('explore_card')) { message.value = '探索权限已开启 1 小时'; await autoSave() } }
</script>