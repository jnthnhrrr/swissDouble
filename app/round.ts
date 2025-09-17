import type {
  History,
  Round,
  Player,
  Team,
  RegularMatch,
  FreeGameMatch,
  Ranking,
} from './types.js'
import { calculateRanking, sortTeamsByRanking } from './ranking.js'
import { calculateFreeGamers } from './freeGamers.js'
import { getActiveParticipants, calculateCurrentRound } from './tournament.js'
import { setDiff, popRandom, drawRandom } from './utils.js'
import { dump, load } from './storage.js'

export const determineNextRound = (
  participants: Player[],
  history: History
): Round => {
  let [teams, freeGamers] = determineTeams(participants, history)
  let ranking = calculateRanking(participants, history)
  return [
    ...calculatePowerPairing(teams, ranking),
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
  const activeParticipants = getActiveParticipants()
  const forbiddenPairings = calculateForbiddenPartners(
    activeParticipants,
    history
  )
  const freeGamers = calculateFreeGamers(activeParticipants, history)
  if (history.length == 0) {
    return [determineTeamsForFirstRound(participants, freeGamers), freeGamers]
  }
  return [
    drawTeams(activeParticipants, forbiddenPairings, [...freeGamers]),
    [...freeGamers],
  ]
}

export const drawTeams = (
  participants: Player[],
  forbiddenPartners: Record<Player, Set<Player>>,
  freeGamers: Player[]
): Team[] => {
  // Drawing teams randomly, for every round but the first one
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
      // No possible solution with the current drawing, try again from scratch
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
  // This implements the requirement that in the first round, we want to pair
  // each player from the top half of the list with a player from the bottom
  // half.
  //
  // Here, there is no need to check for forbiddenPairings because we are in
  // first round

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

export const calculatePowerPairing = (
  teams: Team[],
  ranking: Ranking
): RegularMatch[] => {
  teams = sortTeamsByRanking(teams, ranking)
  let matches: RegularMatch[] = []
  for (let i = 0; i < teams.length; i += 2) {
    matches.push({
      teams: [teams[i] as Team, teams[i + 1] as Team],
      winningTeam: null,
    })
  }
  return matches
}

export const calculateForbiddenPartners = (
  participants: Player[],
  history: History
) => {
  let forbiddenPartners: Record<Player, Set<Player>> = {}
  for (const participant of participants) {
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

export const roundIsOpen = (round: Round) =>
  round.some((match) => match.winningTeam === null)

export const resetNextRound = (
  history?: History,
  participants?: Player[],
  roundCount?: number
) => {
  if (typeof history === 'undefined') {
    history = load('history') as History
  }
  if (typeof participants === 'undefined') {
    participants = load('participants') as Player[]
  }
  if (typeof roundCount === 'undefined') {
    roundCount = load('roundCount') as number
  }
  history.pop()
  dump('history', history)
  setNextRound(history, participants, roundCount)
}

export const setNextRound = (
  history: History,
  participants: Player[],
  roundCount: number
) => {
  if (calculateCurrentRound() == roundCount) return
  const newHistory: History = [
    ...history,
    determineNextRound(participants, history),
  ]
  dump('history', newHistory)
}
