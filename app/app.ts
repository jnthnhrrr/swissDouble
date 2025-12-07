import { Tournament, TournamentTitle } from './types.js'
import {
  load,
  dump,
  erase,
  StorageKey,
  STORAGE_KEYS,
  migrateHistory,
  ensureSetsToWin,
} from './storage.js'
import { isTruthy, findDuplicates } from './utils.js'
import { writeToInputField } from './dom.js'
import { DEFAULT_FREE_GAME_STRATEGY } from './freeGamers.js'
import { DEFAULT_PAIRING_STRATEGY } from './pairingStrategy.js'

import { setNextRound } from './round.js'
import { tournamentHasStarted, calculateCurrentRound } from './tournament.js'

import { createAlert } from './components/alert.js'
import {
  createDataForm,
  readParticipants,
  onParticipantInputChange,
  readRoundCount,
  readTitle,
  readFreeGameStrategy,
  writeFreeGameStrategy,
  readPairingStrategy,
  writePairingStrategy,
  readSetsToWin,
  writeSetsToWin,
} from './components/dataForm.js'
import { createHeader } from './components/header.js'
import { createFooter } from './components/footer.js'
import { createRoundView, destroyRoundView } from './components/roundView.js'
import {
  createRoundNavigation,
  destroyRoundNavigation,
} from './components/roundNavigation.js'
import { createRankingTable } from './components/rankingTable.js'

if (typeof window !== 'undefined') {
  window.onload = () => render()
}

export const render = () => {
  destroyRoundNavigation()
  destroyRoundView()

  const participants = load('participants', [])
  let history = load('history', [])
  history = migrateHistory(history)
  ensureSetsToWin()
  const roundCount = load('roundCount')
  const title = load('title')
  document.title = title

  createHeader()
  createFooter()

  if (tournamentHasStarted(history)) {
    const participants = load('participants') || []

    createRankingTable(participants, history)
    createRoundNavigation(roundCount)
    createRoundView(calculateCurrentRound())
    return
  }

  createDataForm()
  dump('history', [])

  title && writeToInputField('input-title', load('title'))
  participants &&
    writeToInputField('input-participants', participants.join('\n')) &&
    onParticipantInputChange()
  roundCount &&
    writeToInputField('input-round-count', String(roundCount)) &&
    createRoundNavigation(roundCount)
  const freeGameStrategy = load(
    'freeGameStrategy',
    DEFAULT_FREE_GAME_STRATEGY
  ) as 'bottom-ranking' | 'random'
  writeFreeGameStrategy(freeGameStrategy)
  const pairingStrategy = load('pairingStrategy', DEFAULT_PAIRING_STRATEGY) as
    | 'power-pairing'
    | 'random'
  writePairingStrategy(pairingStrategy)
  const setsToWin = load('setsToWin', 1) as number
  writeSetsToWin(setsToWin)
}

export const startTournament = () => {
  const history = load('history') || []

  if (tournamentHasStarted(history)) return

  const participants = readParticipants()
  const duplicates = findDuplicates(participants)
  if (isTruthy(duplicates)) {
    createAlert(`
      Die folgenden Einträge tauchen doppelt auf:

          ${duplicates.join('\n')}

      Bitte ändere die Einträge, um sie zu vereindeutigen.
    `)
    return
  }

  const roundCount = readRoundCount()
  const freeGameStrategy = readFreeGameStrategy()
  const pairingStrategy = readPairingStrategy()
  const setsToWin = readSetsToWin()
  dump('participants', participants)
  dump('roundCount', roundCount)
  dump('title', readTitle())
  dump('freeGameStrategy', freeGameStrategy)
  dump('pairingStrategy', pairingStrategy)
  dump('setsToWin', setsToWin)
  dump('history', history)

  setNextRound(history, roundCount)
  render()
}

export const createTournament = () => {
  storeTournament()
  for (const key of STORAGE_KEYS) {
    erase(key)
  }
  render()
}

export const storeTournament = () => {
  const history = load('history')
  if (!tournamentHasStarted(history)) return

  const title = load('title')
  const tournament = {
    title: title,
    history: load('history'),
    participants: load('participants'),
    roundCount: load('roundCount'),
    departedPlayers: load('departedPlayers'),
    freeGameStrategy: load('freeGameStrategy', DEFAULT_FREE_GAME_STRATEGY),
    pairingStrategy: load('pairingStrategy', DEFAULT_PAIRING_STRATEGY),
    setsToWin: load('setsToWin', 1),
  }
  let storeValue = load('savedTournaments') || {}
  storeValue[title] = tournament
  dump('savedTournaments', storeValue)
}

export const openTournament = (title: TournamentTitle) => {
  storeTournament()

  const savedTournaments = load('savedTournaments')
  const tournament: Tournament = {
    ...savedTournaments[title],
    freeGameStrategy:
      savedTournaments[title].freeGameStrategy || DEFAULT_FREE_GAME_STRATEGY,
    pairingStrategy:
      savedTournaments[title].pairingStrategy || DEFAULT_PAIRING_STRATEGY,
    setsToWin: savedTournaments[title].setsToWin || 1,
  }
  if (tournament.history) {
    tournament.history = migrateHistory(tournament.history)
  }
  for (const key of Object.keys(tournament) as (keyof Tournament)[]) {
    dump(key, tournament[key])
  }
  render()
}

const downloadJSON = (data: Record<string, any>, filename: string) => {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const exportTournament = () => {
  const title = load('title')
  const data: Record<string, any> = {}

  for (const key of STORAGE_KEYS) {
    const value = load(key)
    if (value !== null) {
      data[key] = value
    }
  }
  downloadJSON(data, title + '.json')
}

export const openImportFileDialogue = () => {
  document.getElementById('import-tournament-file-input')!.click()
}

export const importTournament = (event: Event) => {
  // This does not contain validation that the stored file complies with the
  // StorageSchema
  const file = (event.target as HTMLInputElement).files![0]

  if (!file) {
    return
  }

  const reader = new FileReader()
  reader.onload = function (e) {
    const data = JSON.parse(e.target!.result as string)

    if (data.savedTournaments) {
      const savedTournaments = data.savedTournaments
      for (const title in savedTournaments) {
        if (!savedTournaments[title].freeGameStrategy) {
          savedTournaments[title].freeGameStrategy = DEFAULT_FREE_GAME_STRATEGY
        }
        if (!savedTournaments[title].pairingStrategy) {
          savedTournaments[title].pairingStrategy = DEFAULT_PAIRING_STRATEGY
        }
      }
      data.savedTournaments = savedTournaments
    }

    if (!data.freeGameStrategy) {
      data.freeGameStrategy = DEFAULT_FREE_GAME_STRATEGY
    }
    if (!data.pairingStrategy) {
      data.pairingStrategy = DEFAULT_PAIRING_STRATEGY
    }
    if (!data.setsToWin) {
      data.setsToWin = 1
    }

    if (data.history) {
      data.history = migrateHistory(data.history)
    }
    if (data.savedTournaments) {
      for (const title in data.savedTournaments) {
        if (data.savedTournaments[title].history) {
          data.savedTournaments[title].history = migrateHistory(
            data.savedTournaments[title].history
          )
        }
        if (!data.savedTournaments[title].setsToWin) {
          data.savedTournaments[title].setsToWin = 1
        }
      }
    }

    for (const key of Object.keys(data) as StorageKey[]) {
      const value = data[key]
      dump(key, value)
    }
    render()
  }
  reader.readAsText(file)
}
