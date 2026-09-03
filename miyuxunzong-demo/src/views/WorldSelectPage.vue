<template>
  <main class="page">
    <header class="topbar"><div><p class="eyebrow">任务档案</p><h1>选择主题世界</h1></div><button @click="router.push('/profile')">👤 个人中心</button></header>
    <section class="cards">
      <button v-for="(world, index) in worlds" :key="world.id" class="card" :class="{ active: world.unlocked, selected: index === selectedWorld }" :disabled="!world.unlocked" @click="enter(world.id, world.unlocked)">
        <span class="card-status">{{ index === selectedWorld ? '▶ 已选择' : world.unlocked ? '● 当前可用' : '🔒 待开放' }}</span><strong>{{ world.title }}</strong><small>{{ world.description }}</small>
      </button>
    </section>
  </main>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const selectedWorld = ref(0)
const worlds = [
  { id:'tempered_1937', title:'淬火 1937', description:'七七事变 · 潜伏敌后', unlocked:true },
  { id:'dawn_1927', title:'破晓 1927', description:'白色恐怖 · 建立特科', unlocked:false },
  { id:'decisive_1948', title:'决战 1948', description:'战略决战 · 情报决胜', unlocked:false },
  { id:'newborn_1949', title:'新生 1949', description:'开国大典 · 反特除奸', unlocked:false },
  { id:'tide_1983', title:'潮涌 1983', description:'改革开放 · 国安初创', unlocked:false },
  { id:'invisible_2022', title:'无形 2022', description:'数字时代 · 守护安全', unlocked:false },
  { id:'vigil_2026', title:'守望 2026', description:'展望未来 · 共筑长城', unlocked:false },
]
function enter(id:string, unlocked:boolean) { if (unlocked) router.push(`/map/${id}`) }
function onKeydown(event: KeyboardEvent) { const columns = window.innerWidth > 820 ? 4 : 2; if (event.key === 'ArrowRight') { event.preventDefault(); selectedWorld.value = Math.min(worlds.length - 1, selectedWorld.value + 1) } else if (event.key === 'ArrowLeft') { event.preventDefault(); selectedWorld.value = Math.max(0, selectedWorld.value - 1) } else if (event.key === 'ArrowDown') { event.preventDefault(); selectedWorld.value = Math.min(worlds.length - 1, selectedWorld.value + columns) } else if (event.key === 'ArrowUp') { event.preventDefault(); selectedWorld.value = Math.max(0, selectedWorld.value - columns) } else if (event.key === 'Enter') { event.preventDefault(); const world = worlds[selectedWorld.value]; enter(world.id, world.unlocked) } }
onMounted(() => window.addEventListener('keydown', onKeydown)); onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>
