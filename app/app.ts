import { Tournament, TournamentTitle } from './types'
import { load, dump, erase, StorageKey, STORAGE_KEYS } from './storage.js'
import { isTruthy, findDuplicates } from './utils.js'
import { writeToInputField } from './dom.js'

import { setNextRound } from './round'
import { tournamentHasStarted, calculateCurrentRound } from './tournament'

import { createAlert } from './components/alert'
import {
  createDataForm,
  readParticipants,
  onParticipantInputChange,
  readRoundCount,
  readTitle,
} from './components/dataForm'
import { createHeader } from './components/header'
import { createRoundView, destroyRoundView } from './components/roundView'
import {
  createRoundNavigation,
  destroyRoundNavigation,
} from './components/roundNavigation'
import { createRankingTable } from './components/rankingTable'

window.onload = () => render()

export const render = () => {
  destroyRoundNavigation()
  destroyRoundView()

  const participants = load('participants', [])
  const history = load('history', [])
  const roundCount = load('roundCount')
  const title = load('title')
  document.title = title

  createHeader()

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
  dump('participants', participants)
  dump('roundCount', roundCount)
  dump('title', readTitle())
  dump('history', history)

  setNextRound(history, participants, roundCount)
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
  }
  let storeValue = load('savedTournaments') || {}
  storeValue[title] = tournament
  dump('savedTournaments', storeValue)
}

export const openTournament = (title: TournamentTitle) => {
  storeTournament()

  const tournament: Tournament = load('savedTournaments')[title]
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

    for (const key of Object.keys(data) as StorageKey[]) {
      const value = data[key]
      dump(key, value)
    }
    render()
  }
  reader.readAsText(file)
}
