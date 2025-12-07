import type { History, Player } from './types.js'
import { load, dump } from './storage.js'
import { isTruthy } from './utils.js'
import { roundIsOpen } from './round.js'

export const tournamentHasStarted = (history: History) => isTruthy(history)

export const tournamentHasFinished = (history: History, roundCount: number) => {
  return history.length == roundCount && !roundIsOpen(history[roundCount - 1])
}

export const calculateCurrentRound = (): number => {
  const history = load('history')
  return history.length
}

export const getActiveParticipants = (): Player[] => {
  const participants = load('participants')
  let departedPlayers = load('departedPlayers', {})
  return participants.filter((participant) => {
    return !(participant in departedPlayers)
  })
}

export const incrementRoundCount = (): boolean => {
  const history = load('history', [])
  if (!tournamentHasStarted(history)) {
    return false
  }
  const currentRoundCount = load('roundCount') as number
  dump('roundCount', currentRoundCount + 1)
  return true
}
