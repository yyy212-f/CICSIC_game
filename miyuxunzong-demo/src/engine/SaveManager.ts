import { get, set, del } from 'idb-keyval'
import { useGameStore } from '../stores/gameStore'
import type { SaveData } from '../types'

const SAVE_KEY = 'miyuxunzong_demo_save'
const AUTO_KEY = 'miyuxunzong_demo_auto'

export async function saveGame(slot: 'manual' | 'auto' = 'manual') {
  const store = useGameStore()
  const key = slot === 'auto' ? AUTO_KEY : SAVE_KEY
  await set(key, store.toSaveData())
}

export async function loadGame(slot: 'manual' | 'auto' = 'manual'): Promise<boolean> {
  const key = slot === 'auto' ? AUTO_KEY : SAVE_KEY
  const data: SaveData | undefined = await get(key)
  if (!data) return false
  const store = useGameStore()
  store.loadSave(data)
  return true
}

export async function deleteSave() {
  await del(SAVE_KEY)
  await del(AUTO_KEY)
}

export async function autoSave() {
  await saveGame('auto')
}

export async function hasSave(): Promise<boolean> {
  return !!((await get(SAVE_KEY)) || (await get(AUTO_KEY)))
}
