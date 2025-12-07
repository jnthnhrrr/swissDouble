import type {
  History,
  Round,
  Player,
  Team,
  RegularMatch,
  FreeGameMatch,
  Ranking,
  FreeGameStrategy,
  PairingStrategy,
} from './types.js'
import { calculateRanking, getRankingOrder } from './ranking.js'
import {
  calculateFreeGamers,
  DEFAULT_FREE_GAME_STRATEGY,
} from './freeGamers.js'
import { pairTeams, DEFAULT_PAIRING_STRATEGY } from './pairingStrategy.js'
import { getActiveParticipants, calculateCurrentRound } from './tournament.js'
import { setDiff, popRandom, drawRandom } from './utils.js'
import { dump, load } from './storage.js'

export const determineNextRound = (history: History): Round => {
  const activeParticipants = getActiveParticipants()
  let [teams, freeGamers] = determineTeams(activeParticipants, history)
  const rankingOrder = getRankingOrder()
  let ranking = calculateRanking(activeParticipants, history, rankingOrder)
  const pairingStrategy = load(
    'pairingStrategy',
    DEFAULT_PAIRING_STRATEGY
  ) as PairingStrategy
  return [
    ...pairTeams(teams, ranking, pairingStrategy),
    ...freeGameMatches(freeGamers),
  ]
}

const freeGameMatches = (freeGamers: Player[]): FreeGameMatch[] => {
  let matches: FreeGameMatch[] = []
  for (const freeGamer of freeGamers) {
    matches.push({
      isFreeGame: true,
      player: freeGamer,
    })
  }
  return matches
}

export const determineTeams = (
  participants: Player[],
  history: History
): [Team[], Player[]] => {
  const forbiddenPairings = calculateForbiddenPartners(participants, history)
  const freeGameStrategy = load(
    'freeGameStrategy',
    DEFAULT_FREE_GAME_STRATEGY
  ) as FreeGameStrategy
  const freeGamers = calculateFreeGamers(
    participants,
    history,
    freeGameStrategy
  )
  if (history.length == 0) {
    return [determineTeamsForFirstRound(participants, freeGamers), freeGamers]
  }
  return [
    drawTeams(participants, forbiddenPairings, [...freeGamers]),
    [...freeGamers],
  ]
}

export const drawTeams = (
  participants: Player[],
  forbiddenPartners: Record<Player, Set<Player>>,
  freeGamers: Player[]
): Team[] => {
  const players = setDiff(participants, freeGamers)
  let teams: Team[] = []
  while (players.size > 0) {
    const [playerOne] = players
    players.delete(playerOne)
    const possiblePartners = setDiff(
      [...players],
      [...forbiddenPartners[playerOne]]
    )
    if (possiblePartners.size == 0) {
      return drawTeams(participants, forbiddenPartners, freeGamers)
    }
    const playerTwo = drawRandom(possiblePartners)
    players.delete(playerTwo)
    teams.push([playerOne, playerTwo])
  }
  return teams
}

export const determineTeamsForFirstRound = (
  participants: Player[],
  freeGamers: Player[]
): Team[] => {
  const players = [...setDiff(participants, freeGamers)]
  let teams: Team[] = []
  const breakIndex = players.length / 2
  const topHalf = players.slice(0, breakIndex)
  const bottomHalf = players.slice(breakIndex, players.length)
  for (const topPlayer of topHalf) {
    const bottomPlayer = popRandom(bottomHalf)
    teams.push([topPlayer, bottomPlayer])
  }
  return teams
}

export const calculateForbiddenPartners = (
  participants: Player[],
  history: History
) => {
  const allParticipants = load('participants') as Player[]
  let forbiddenPartners: Record<Player, Set<Player>> = {}
  for (const participant of allParticipants) {
    forbiddenPartners[participant] = new Set([participant])
  }
  for (const round of history) {
    for (const match of round) {
      if ('isFreeGame' in match) {
        continue
      }
      for (const team of match.teams) {
        forbiddenPartners[team[0]].add(team[1])
        forbiddenPartners[team[1]].add(team[0])
      }
    }
  }
  return forbiddenPartners
}

export const roundIsOpen = (round: Round) => {
  return round.some((match) => {
    if ('isFreeGame' in match) {
      return false
    }
    return match.winningTeam === null || match.winningTeam === undefined
  })
}

export const resetNextRound = () => {
  const history = load('history') as History
  const roundCount = load('roundCount') as number
  history.pop()
  dump('history', history)
  setNextRound(history, roundCount)
}

export const setNextRound = (history: History, roundCount: number) => {
  if (calculateCurrentRound() == roundCount) return
  const newHistory: History = [...history, determineNextRound(history)]
  dump('history', newHistory)
}
