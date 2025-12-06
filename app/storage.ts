import type { Tournament, TournamentTitle, FreeGameStrategy } from './types.js'

export interface StorageSchema extends Tournament {
  correctingRound: number
  savedTournaments: Record<TournamentTitle, Tournament>
  freeGameStrategy: FreeGameStrategy
}
export type StorageKey = keyof StorageSchema

export const STORAGE_KEYS: StorageKey[] = [
  'history',
  'participants',
  'roundCount',
  'title',
  'departedPlayers',
  'savedTournaments',
  'correctingRound',
  'freeGameStrategy',
]

interface Loading {
  <K extends StorageKey>(
    key: K,
    defaultValue?: StorageSchema[K]
  ): StorageSchema[K]
}

interface Dumping {
  <K extends StorageKey>(key: K, value: StorageSchema[K]): void
}

const ROOT: string = 'swiss-double'
export const getStoreValue = () => {
  let value = JSON.parse(localStorage.getItem(ROOT) as string)
  return value ? value : {}
}

export const setStoreValue = (value: any) =>
  localStorage.setItem(ROOT, JSON.stringify(value))

export const load: Loading = (key: string, defaultValue?: any) => {
  const value = getStoreValue()[key]
  return typeof value === 'undefined' ? defaultValue : value
}
export const dump: Dumping = (key: string, value: any) => {
  let storeValue = getStoreValue()
  storeValue[key] = value
  setStoreValue(storeValue)
}

export const erase = (key: StorageKey) => {
  let store = getStoreValue()
  delete store[key]
  setStoreValue(store)
}
