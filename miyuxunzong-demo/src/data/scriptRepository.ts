import type { Script } from '../types'

let temperedScriptPromise: Promise<Script> | null = null

export function loadTemperedScript(): Promise<Script> {
  if (!temperedScriptPromise) {
    const base = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/data/scripts/tempered_1937`
    temperedScriptPromise = fetch(`${base}/manifest.json`, { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error(`剧情清单加载失败（HTTP ${response.status}）`)
        return response.json() as Promise<Omit<Script, 'chapters'> & { chapters: { file: string }[] }>
      })
      .then(async manifestData => {
        const chapters = await Promise.all(manifestData.chapters.map(async entry => {
          const response = await fetch(`${base}/${entry.file}`, { cache: 'no-store' })
          if (!response.ok) throw new Error(`剧情章节加载失败（HTTP ${response.status}）`)
          return response.json()
        }))
        return { ...manifestData, chapters } as Script
      })
      .catch(error => {
        temperedScriptPromise = null
        throw error
      })
  }
  return temperedScriptPromise
}
