import type {
  Tournament,
  TournamentTitle,
  FreeGameStrategy,
  PairingStrategy,
  History,
  Match,
} from './types.js'
import { RegularMatch } from './types.js'

export interface StorageSchema extends Tournament {
  correctingRound: number
  savedTournaments: Record<TournamentTitle, Tournament>
  freeGameStrategy: FreeGameStrategy
  pairingStrategy: PairingStrategy
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
  'pairingStrategy',
  'setsToWin',
  'rankingOrder',
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
  const result = typeof value === 'undefined' ? defaultValue : value
  
  if (key === 'history' && result) {
    return migrateHistory(result)
  }
  
  if (key === 'savedTournaments' && result) {
    const migrated = { ...result }
    for (const title in migrated) {
      if (migrated[title].history) {
        migrated[title].history = migrateHistory(migrated[title].history)
      }
    }
    return migrated
  }
  
  return result
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

export const migrateHistory = (history: History): History => {
  if (!history || !Array.isArray(history)) return history

  return history.map((round) =>
    round.map((match) => {
      if ('isFreeGame' in match) {
        return match
      }
      if (match instanceof RegularMatch) {
        return match
      }
      return RegularMatch.fromPlainObject(match as any)
    })
  )
}

export const ensureSetsToWin = (): number => {
  const setsToWin = load('setsToWin')
  if (setsToWin === undefined || setsToWin === null) {
    dump('setsToWin', 1)
    return 1
  }
  return setsToWin as number
}
