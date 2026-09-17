<template><main class="page feature-page station-page"><header class="topbar"><div><p class="eyebrow">情报发送站</p><h1>摩斯密码训练</h1></div><button @click="router.back()">← 地图</button></header><section class="feature-card"><p class="muted">限时 {{ challenge.seconds }} 秒 · {{ challenge.level }}</p><h2>发送：{{ challenge.text }}</h2><p class="morse-answer">点用 <code>.</code>，划用 <code>-</code>，字母之间用空格分隔</p><input v-model="answer" :disabled="done || expired || completed" placeholder="输入摩斯密码" @keyup.enter="submit"><div class="actions"><button class="primary" :disabled="done || expired || completed" @click="submit">发送</button><button @click="next">换一道</button></div><p v-if="result" class="notice">{{ result }}</p></section><section class="feature-card"><h2>摩斯密码表</h2><div class="morse-table"><span v-for="entry in morseAlphabet" :key="entry.letter"><b>{{ entry.letter }}</b><code>{{ entry.code }}</code></span></div></section></main></template>
<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import { autoSave } from '../engine/SaveManager'
import { morseChallenges } from '../data/resourceData'

const router = useRouter()
const store = useGameStore()
const index = ref(0)
const answer = ref('')
const result = ref('')
const done = ref(false)
const expired = ref(false)
const challenge = computed(() => morseChallenges[index.value])
const completed = computed(() => store.fragments.includes(`morse:${challenge.value.id}`))
const morseAlphabet = [
  ['A','.-'],['B','-...'],['C','-.-.'],['D','-..'],['E','.'],['F','..-.'],['G','--.'],['H','....'],['I','..'],['J','.---'],['K','-.-'],['L','.-..'],['M','--'],['N','-.'],['O','---'],['P','.--.'],['Q','--.-'],['R','.-.'],['S','...'],['T','-'],['U','..-'],['V','...-'],['W','.--'],['X','-..-'],['Y','-.--'],['Z','--..'],
].map(([letter, code]) => ({ letter, code }))
let timer: ReturnType<typeof setTimeout> | undefined

function arm() {
  if (timer) clearTimeout(timer)
  done.value = false
  expired.value = false
  answer.value = ''
  result.value = ''
  if (completed.value) {
    done.value = true
    result.value = '本条情报已成功发送，奖励已领取。'
    return
  }
  timer = setTimeout(() => {
    if (!done.value) {
      expired.value = true
      result.value = '时间到，挑战失败。'
    }
  }, challenge.value.seconds * 1000)
}

function next() {
  index.value = (index.value + 1) % morseChallenges.length
  arm()
}

async function submit() {
  if (done.value || expired.value || completed.value) return
  if (answer.value.trim().replace(/\s+/g, ' ') === challenge.value.answer) {
    done.value = true
    const bonus = challenge.value.id.endsWith('abort') ? 5 : 0
    store.addFeathers(challenge.value.reward + bonus)
    store.addFragment(`morse:${challenge.value.id}`)
    if (index.value % 3 === 0 && !store.items.includes('amulet')) store.addItem('amulet')
    else if (index.value % 3 === 1 && !store.items.includes('rebound_card')) store.addItem('rebound_card')
    result.value = index.value % 3 === 0 && store.items.includes('amulet') ? `宝箱开启：羽毛 +${challenge.value.reward + bonus}，获得技能卡「护身符」` : index.value % 3 === 1 && store.items.includes('rebound_card') ? `宝箱开启：羽毛 +${challenge.value.reward + bonus}，获得技能卡「触底反弹卡」` : `宝箱开启：获得剧情情报碎片，羽毛 +${challenge.value.reward + bonus}`
    await autoSave()
  } else {
    result.value = '密码不匹配，请检查点划和字母间隔。'
  }
}

arm()
onUnmounted(() => { if (timer) clearTimeout(timer) })
</script>