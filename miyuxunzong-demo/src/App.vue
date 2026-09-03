<template>
  <div class="app-shell">
    <Transition name="splash-fade">
      <div v-if="showSplash" class="splash-overlay">
        <div class="splash-card">
          <div class="splash-badge">DEMO</div>
          <h1 class="splash-title">密羽寻踪</h1>
          <p class="splash-subtitle">沉浸式国家安全教育 · 互动叙事体验</p>

          <div class="splash-guide">
            <h3>游戏向导</h3>
            <ul>
              <li>选择世界，踏入不同历史时期的情报战场</li>
              <li>探索地图，发现情报节点与任务目标</li>
              <li>审慎决策，你的选择将影响故事走向</li>
              <li>完成考验，收集故事碎片拼凑历史真相</li>
            </ul>
          </div>

          <div class="splash-backstory">
            <h3>故事背景</h3>
            <p>1936 年冬，北平气象台地下室，你——一名大学生——在煤油灯下举起右拳，秘密加入中国共产党，代号"渡鸦"。半年后，卢沟桥枪声响起，抗战全面爆发。你接组织密令，以探亲名义离校南下，相机了解社会动态；随后辗转寻找组织，潜伏敌后，在黑暗中守望光明。</p>
            <p>你的每一次抉择——行李中藏匿什么、面对搜查如何应答、是否信任同伴——都将影响怀疑、洞察与信念三项数值，通向截然不同的结局。</p>
          </div>

          <div class="splash-disclaimer">
            <strong>重要提示</strong>
            <p>当前 <strong>demo</strong> 仅用于功能验证，不包含最终美术内容，<em>不代表游戏最终品质与视觉效果</em>。</p>
          </div>

          <button class="splash-enter" @click="enterGame">开始体验</button>
        </div>
      </div>
    </Transition>
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in"><component :is="Component" /></transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { loadGame } from './engine/SaveManager'

const showSplash = ref(true)

function enterGame() {
  showSplash.value = false
}

onMounted(() => { void loadGame('auto') })
</script>
