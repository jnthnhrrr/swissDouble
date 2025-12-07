import type {
  History,
  Ranking,
  Player,
  Team,
  Points,
  Buchholz,
} from './types.js'
import { roundIsOpen } from './round.js'

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
      // If round is not open, winningTeam must be 0 or 1 (never null)
      // This is guaranteed by roundIsOpen logic
      const winningTeam = match.winningTeam as 0 | 1
      for (const winningPlayer of match.teams[winningTeam]) {
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

export const sortTeamsByRanking = (teams: Team[], ranking: Ranking): Team[] => {
  const rankingMap: Record<Player, [Points, Buchholz]> = {}
  for (const [player, points, buchholz] of ranking) {
    rankingMap[player] = [points, buchholz]
  }
  teams.sort((thisTeam: Team, otherTeam: Team) => {
    const thisTeamPoints =
      rankingMap[thisTeam[0]][0] + rankingMap[thisTeam[1]][0]
    const otherTeamPoints =
      rankingMap[otherTeam[0]][0] + rankingMap[otherTeam[1]][0]
    const thisTeamBuchholz =
      rankingMap[thisTeam[0]][1] + rankingMap[thisTeam[1]][1]
    const otherTeamBuchholz =
      rankingMap[otherTeam[0]][1] + rankingMap[otherTeam[1]][1]
    if (thisTeamPoints == otherTeamPoints) {
      return thisTeamBuchholz > otherTeamBuchholz ? -1 : 1
    }
    return thisTeamPoints > otherTeamPoints ? -1 : 1
  })
  return teams
}
