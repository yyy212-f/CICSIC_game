import { createRouter, createWebHashHistory } from 'vue-router'

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

export default createRouter({ history: createWebHashHistory(), routes })
