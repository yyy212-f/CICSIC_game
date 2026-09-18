<template>
  <main class="page feature-page market-page">
    <header class="topbar">
      <div><p class="eyebrow">虚拟市集</p><h1>羽毛兑换</h1></div>
      <button @click="router.push(`/map/${route.params.worldId}`)">← 地图</button>
    </header>
    <p class="notice">当前羽毛：{{ store.feathers }}</p>
    <section class="feature-grid">
      <article v-for="item in shopItems" :key="item.id" class="feature-card shop-card">
        <div class="shop-thumb">
          <img v-if="item.image" :src="item.image" :alt="item.name" />
          <span v-else-if="item.emoji" class="shop-emoji">{{ item.emoji }}</span>
          <span v-else class="shop-emoji">📦</span>
        </div>
        <div class="shop-info">
          <h2>{{ item.name }}</h2>
          <span class="shop-price">{{ item.price }} 羽毛</span>
        </div>
        <p class="shop-desc">{{ item.description }}</p>
        <p v-if="item.detail" class="shop-detail">{{ item.detail }}</p>
        <button class="primary shop-buy" :disabled="store.feathers < item.price || store.items.includes(item.id)" @click="buy(item)">
          {{ store.items.includes(item.id) ? '已拥有' : '兑换' }}
        </button>
      </article>
    </section>
  </main>
</template>
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import { autoSave } from '../engine/SaveManager'
import { itemCatalog } from '../data/resourceData'

const router = useRouter()
const route = useRoute()
const store = useGameStore()

// 只展示付费可兑换的商品
const shopItems = itemCatalog.filter(item => item.price > 0)

async function buy(item: { id: string; price: number }) {
  if (store.feathers < item.price || store.items.includes(item.id)) return
  store.addFeathers(-item.price)
  store.addItem(item.id)
  await autoSave()
}
</script>