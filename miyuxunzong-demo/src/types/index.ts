export interface PlayerStats {
  suspicion: number; insight: number; conviction: number
  trust_father: number; trust_org: number; worry: number
}
export interface StatEffect { stat: string; change: number }
export interface InventoryChange { add?: string[]; remove?: string[] }
export interface ChoiceCondition {
  stat: string; operator: '>='|'<='|'>'|'<'|'=='; value: number
}
export interface Choice {
  text: string; nextNodeId: string; effects?: StatEffect[]
  inventoryChanges?: InventoryChange; condition?: ChoiceCondition
}
export interface Condition {
  stat: string; operator: '>='|'<='|'>'|'<'|'=='; value: number
  passNodeId?: string; failNodeId?: string
}
export interface Node {
  id: string; type: 'dialogue'|'narration'|'choice'|'condition'|'action'|'ending'
  speaker?: string; content?: string
  figure?: { id: string; position?: 'left'|'center'|'right' }
  choices?: Choice[]; condition?: Condition
  effects?: StatEffect[]; inventoryChanges?: InventoryChange
  nextNodeId?: string; endingType?: string; endingDescription?: string
  characterId?: string; failure?: boolean; checkpoint?: boolean
}
export interface Scene { id: string; bgLabel: string; nodes: Node[] }
export interface Chapter { id: string; title: string; scenes: Scene[] }
export interface Script {
  meta: { id: string; title: string; version?: string; author?: string }
  initialStats?: PlayerStats
  initialInventory?: string[]
  chapters: Chapter[]
}
export interface POI {
  id: string; type: string; x: number; y: number; label: string
  locked: boolean; unlockCondition?: { requireChapter?: string }
}
export interface WorldMap { worldId: string; pois: POI[] }
export interface Quiz {
  id: string; sourceType: 'movie'|'knowledge'; type: 'single'|'judge'
  question: string; options?: string[]; answer: string|boolean
  explanation: string; rewards: { feathers: number }
}
export interface Fragment {
  id: string; groupId: string; order: number; content: string
  unlockCondition: { type: 'quest'|'quiz'|'explore'; refId: string }
  spirit?: string
}
export interface FragmentGroup { id: string; heroName: string; fragments: Fragment[] }
export interface SaveData {
  version: string; lastSaved: number
  stats: PlayerStats; inventory: { feathers: number; items: string[] }
  progress: { currentChapter: string; currentNodeId?: string; completedChapters: string[]; chapterCheckpoints?: Record<string, string> }
  quiz: Record<string, { wrongAttempts: number; passed: boolean }>
  collectibles: { fragments: string[]; fragmentGroups: Record<string,{collected:number;complete:boolean}> }
  metadata: { playTime: number; endingsUnlocked: string[]; unlockedCharacters?: string[]; dailyQuizDate?: string; exploreUntil?: number; retryNodeId?: string }
}

export interface CharacterCard {
  id: string; name: string; role: string; age?: string; origin?: string
  summary: string; identity: '平民'|'我方潜伏人员'|'国民党特务'|string
  clues: string[]; portrait?: string
}

export interface MorseChallenge {
  id: string; level: '初级'|'中级'|'高级'; text: string; answer: string; seconds: number; reward: number
}
