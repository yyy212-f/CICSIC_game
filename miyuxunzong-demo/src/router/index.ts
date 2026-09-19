import { createRouter, createWebHashHistory } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import manifest from '../data/scripts/tempered_1937/manifest.json'

// 判断某章节是否已解锁（前面的章节都完成了）
// 用 manifest 的 chapters 来判断，因为它是元数据不会被剧本 BOM 问题影响
function isChapterUnlocked(chapterId: string, completedChapters: string[]): { unlocked: boolean; needChapter?: string } {
  const allIds = manifest.chapters.map(c => c.id)
  const idx = allIds.indexOf(chapterId)
  if (idx <= 0) return { unlocked: true }  // 第一章永远可用
  const prev = allIds[idx - 1]
  if (completedChapters.includes(prev)) return { unlocked: true }
  const label = manifest.chapters.find(c => c.id === prev)?.title || prev
  return { unlocked: false, needChapter: label }
}

const routes = [
  { path: '/',            name: 'home',     component: () => import('../views/HomePage.vue') },
  { path: '/worlds',      name: 'worlds',   component: () => import('../views/WorldSelectPage.vue') },
  { path: '/map/:worldId', name: 'map',     component: () => import('../views/WorldMapPage.vue') },
  { path: '/narrative/:chapterId/:sceneId?', name: 'narrative', component: () => import('../views/NarrativePage.vue') },
  { path: '/station/:worldId/:stationId', name: 'station',     component: () => import('../views/StationPage.vue') },
  { path: '/cinema/:worldId', name: 'cinema', component: () => import('../views/CinemaPage.vue') },
  { path: '/fragments/:worldId', name: 'fragments', component: () => import('../views/FragmentPage.vue') },
  { path: '/identity/:caseId', name: 'identity', component: () => import('../views/IdentityPage.vue') },
  { path: '/market/:worldId', name: 'market', component: () => import('../views/MarketPage.vue') },
  { path: '/profile',     name: 'profile',  component: () => import('../views/ProfilePage.vue') },
]

const router = createRouter({ history: createWebHashHistory(), routes })

// 关卡解锁守卫：禁止通过 URL 直接访问未完成的章节
router.beforeEach((to) => {
  if (to.name !== 'narrative') return true
  const targetChapter = String(to.params.chapterId || '')
  if (!targetChapter) return true
  try {
    const store = useGameStore()
    const { unlocked, needChapter } = isChapterUnlocked(targetChapter, store.completedChapters)
    if (unlocked) return true
    alert(`请先完成上一章节：${needChapter || '上一节剧情'}`)
    return { path: '/map/tempered_1937' }
  } catch {
    return true
  }
})

export default router