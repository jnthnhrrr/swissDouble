import type { History, Player } from './types.js'
import { load } from './storage.js'
import { isTruthy } from './utils.js'
import { roundIsOpen } from './round.js'

export const tournamentHasStarted = (history: History) => isTruthy(history)

export const tournamentHasFinished = (history: History, roundCount: number) => {
  return history.length == roundCount && !roundIsOpen(history[roundCount - 1])
}

export const calculateCurrentRound = (): number => {
  // which round is current round, 1-indexed
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
