<template>
  <div
    ref="layerRef"
    class="watermark-layer"
    id="app-watermark"
    aria-hidden="true"
  >
    <span
      v-for="(wm, i) in marks"
      :key="i"
      class="watermark-text"
      :style="{ left: wm.x + 'px', top: wm.y + 'px' }"
    >{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

// 可调参数
const text     = ref('zsc hym fsy lyz msh zec')
const fontSize = ref(14)
const opacity  = ref(0.02)   // 2% 透明度：肉眼几乎不可见
const angle    = ref(-35)   // 旋转角度
const gapX     = 230
const gapY     = 170

const layerRef = ref<HTMLDivElement | null>(null)
const marks = ref<{ x: number; y: number }[]>([])

function layout() {
  const w = window.innerWidth  + gapX
  const h = window.innerHeight + gapY
  const cols = Math.ceil(w / gapX) + 1
  const rows = Math.ceil(h / gapY) + 1
  const list: { x: number; y: number }[] = []
  for (let r = -1; r < rows; r++) {
    for (let c = -1; c < cols; c++) {
      list.push({ x: c * gapX, y: r * gapY })
    }
  }
  marks.value = list
}

// 用 JS 动态设置 CSS 变量（比 CSS v-bind 更兼容）
function applyVars() {
  const el = layerRef.value
  if (!el) return
  el.style.setProperty('--wm-font-size', fontSize.value + 'px')
  el.style.setProperty('--wm-opacity',  String(opacity.value))
  el.style.setProperty('--wm-angle',     angle.value + 'deg')
}

// 任意参数变化时重新设置
watch([fontSize, opacity, angle], applyVars)

let ro: ResizeObserver | null = null
let mo: MutationObserver | null = null

onMounted(() => {
  applyVars()
  layout()
  window.addEventListener('resize', layout)

  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(layout)
    ro.observe(document.body)
  }

  mo = new MutationObserver(() => {
    if (!document.getElementById('app-watermark')) {
      marks.value = []
      requestAnimationFrame(layout)
    }
  })
  mo.observe(document.body, { childList: true, subtree: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', layout)
  ro?.disconnect()
  mo?.disconnect()
})
</script>

<style scoped>
.watermark-layer {
  position: fixed;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  overflow: hidden;
  user-select: none;
}

.watermark-text {
  position: absolute;
  font-size: var(--wm-font-size);
  font-family: "Microsoft YaHei", Inter, sans-serif;
  color: rgba(168, 50, 37, var(--wm-opacity));
  letter-spacing: 2px;
  white-space: nowrap;
  transform: rotate(var(--wm-angle));
  user-select: none;
  -webkit-user-drag: none;
  -webkit-touch-callout: none;
}
</style>