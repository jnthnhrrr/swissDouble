import type {
  History,
  Round,
  Ranking,
  Player,
  Team,
  Points,
  Buchholz,
} from './types.js'
import { load, dump } from './storage.js'
import { isTruthy, setDiff, popRandom, drawRandom } from './utils.js'

export const tournamentHasStarted = (history: History) => isTruthy(history)

export const tournamentHasFinished = (history: History, roundCount: number) => {
  return history.length == roundCount && !roundIsOpen(history[roundCount - 1])
}

export const roundIsOpen = (round: Round) =>
  round.some((match) => match.winningTeam === null)

export const calculateCurrentRound = () => {
  // which round is current round, 1-indexed
  const history = load('history')
  return history.length
}

export const getActiveParticipants = () => {
  const participants: Player[] = load('participants')
  let departedPlayers = load('departedPlayers', {})
  departedPlayers = typeof departedPlayers != 'undefined' ? departedPlayers : {}
  const activeParticipants = participants.filter((participant) => {
    return !(participant in departedPlayers)
  })
  return activeParticipants
}

export const determineNextRound = (
  participants: Player[],
  history: History
): Round => {
  const ranking = calculateRanking(participants, history)
  const rankingObject = Object.fromEntries(ranking)
  const activeParticipants = getActiveParticipants()
  const forbiddenPairings = calculateForbiddenPairings(
    activeParticipants,
    history
  )
  const freeGamers = calculateFreeGamers(activeParticipants, history)
  let pairings
  if (history.length == 0) {
    pairings = drawPairingsForFirstRound(participants, freeGamers)
  } else {
    pairings = drawPairings(activeParticipants, forbiddenPairings, [
      ...freeGamers,
    ]).sort((team: Team) => rankingObject[team[0]] + rankingObject[team[1]])
  }
  let matches: Round = []
  for (let i = 0; i < pairings.length; i += 2) {
    matches.push({
      teams: [pairings[i] as Team, pairings[i + 1] as Team],
      winningTeam: null,
    })
  }

  for (const freeGamer of freeGamers) {
    matches.push({
      isFreeGame: true,
      player: freeGamer,
    })
  }
  return matches
}

export const calculateForbiddenPairings = (
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

export const drawPairings = (
  participants: Player[],
  forbiddenPairings: Record<Player, Set<Player>>,
  freeGamers: Player[]
): Team[] => {
  participants = [...new Set(participants)]
  const players = setDiff(participants, freeGamers)
  let pairings: Team[] = []
  while (players.size > 0) {
    const [playerOne] = players
    players.delete(playerOne)
    const possiblePartners = setDiff(
      [...players],
      [...forbiddenPairings[playerOne]]
    )
    if (possiblePartners.size == 0) {
      // No possible solution with the current drawing, try again from scratch
      return drawPairings(participants, forbiddenPairings, freeGamers)
    }
    const playerTwo = drawRandom(possiblePartners)
    players.delete(playerTwo)
    pairings.push([playerOne, playerTwo])
  }
  return pairings
}

export const drawPairingsForFirstRound = (
  participants: Player[],
  freeGamers: Set<Player>
) => {
  // This implements the requirement that in the first round, we want to pair
  // each player from the top half of the list with a player from the bottom
  // half.
  //
  // Here, there is no need to check for forbiddenPairings because we are in
  // first round

  const players = [...setDiff(participants, [...freeGamers])]
  let pairings = []
  const breakIndex = players.length / 2
  const topHalf = players.slice(0, breakIndex)
  const bottomHalf = players.slice(breakIndex, players.length)
  for (const topPlayer of topHalf) {
    const bottomPlayer = popRandom(bottomHalf)
    pairings.push([topPlayer, bottomPlayer])
  }
  return pairings
}

export const calculateFreeGamers = (
  participants: Player[],
  history: History
): Set<Player> => {
  // Participants with the lowest ranking who have not yet had a free game will
  // get a free game.
  let ranking: Ranking = calculateRanking(participants, history)
  const participantCount = participants.length
  const freeGamesCount = participantCount % 4
  let freeGamers: Set<Player> = new Set([])
  if (freeGamesCount == 0) {
    return freeGamers
  }
  for (const [player, _] of ranking.reverse()) {
    if (!playerHadFreeGame(player, history)) {
      freeGamers.add(player)
    }
    if (freeGamers.size == freeGamesCount) {
      return freeGamers
    }
  }
  return freeGamers
}

export const playerHadFreeGame = (player: Player, history: History) => {
  for (const round of history) {
    for (const match of round) {
      if (!('isFreeGame' in match)) {
        continue
      }
      if (match.player == player) {
        return true
      }
    }
  }
  return false
}

export const calculatePoints = (
  participants: Player[],
  history: History
): Record<Player, Points> => {
  let ranking: Record<Player, Points> = {}
  for (const participant of participants) {
    ranking[participant] = 0
  }
  for (const round of history) {
    if (roundIsOpen(round)) {
      continue
    }
    for (const match of round) {
      if ('isFreeGame' in match) {
        ranking[match.player] += 1
        continue
      }
      // match.winningTeam is a number: above we checked the round is not open
      for (const winningPlayer of match.teams[match.winningTeam as number]) {
        ranking[winningPlayer] += 1
      }
    }
  }
  return ranking
}

export const calculateBuchholz = (
  points: Record<Player, Points>,
  history: History
): Record<Player, Buchholz> => {
  const buchholz: Record<Player, Buchholz> = {}
  for (const player of Object.keys(points)) {
    buchholz[player] = 0
  }

  for (const round of history) {
    if (roundIsOpen(round)) {
      continue
    }
    for (const match of round) {
      if ('isFreeGame' in match) {
        continue
      }
      const teams = match.teams
      /* Subtracting points of partner */
      buchholz[teams[0][0]] -= points[teams[0][1]]
      buchholz[teams[0][1]] -= points[teams[0][0]]
      buchholz[teams[1][0]] -= points[teams[1][1]]
      buchholz[teams[1][1]] -= points[teams[1][0]]

      /* Adding points of opponents */
      buchholz[teams[0][0]] += points[teams[1][0]] + points[teams[1][1]]
      buchholz[teams[0][1]] += points[teams[1][0]] + points[teams[1][1]]
      buchholz[teams[1][0]] += points[teams[0][0]] + points[teams[0][1]]
      buchholz[teams[1][1]] += points[teams[0][0]] + points[teams[0][1]]
    }
  }
  return buchholz
}

export const calculateRanking = (
  participants: Player[],
  history: History
): Ranking => {
  // Returns sorted array of tuples [player, points, buchholz]
  let points = calculatePoints(participants, history)
  let buchholz = calculateBuchholz(points, history)
  let ranking: Ranking = participants.map((participant) => [
    participant,
    points[participant],
    buchholz[participant],
  ])
  return ranking.sort((here, there) => there[1] - here[1] || there[2] - here[2])
}

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
