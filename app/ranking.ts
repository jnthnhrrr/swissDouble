import type {
  History,
  Ranking,
  Player,
  Team,
  Points,
  Buchholz,
  SetPoints,
} from './types.js'
import { roundIsOpen } from './round.js'
import { load } from './storage.js'

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
      buchholz[teams[0][0]] -= points[teams[0][1]]
      buchholz[teams[0][1]] -= points[teams[0][0]]
      buchholz[teams[1][0]] -= points[teams[1][1]]
      buchholz[teams[1][1]] -= points[teams[1][0]]
      buchholz[teams[0][0]] += points[teams[1][0]] + points[teams[1][1]]
      buchholz[teams[0][1]] += points[teams[1][0]] + points[teams[1][1]]
      buchholz[teams[1][0]] += points[teams[0][0]] + points[teams[0][1]]
      buchholz[teams[1][1]] += points[teams[0][0]] + points[teams[0][1]]
    }
  }
  return buchholz
}

export const calculateSetPoints = (
  participants: Player[],
  history: History
): Record<Player, SetPoints> => {
  const setPoints: Record<Player, SetPoints> = {}
  for (const participant of participants) {
    setPoints[participant] = 0
  }

  for (const round of history) {
    if (roundIsOpen(round)) {
      continue
    }
    for (const match of round) {
      if ('isFreeGame' in match) {
        continue
      }
      // Skip if match doesn't have setsWon (old-style matches) or not completed
      if (!('setsWon' in match) || !match.setsWon) {
        continue
      }
      if (match.setsWon[0] === null || match.setsWon[1] === null) {
        continue
      }
      const teams = match.teams
      const setsWon0 = match.setsWon[0]
      const setsWon1 = match.setsWon[1]

      setPoints[teams[0][0]] += setsWon0 - setsWon1
      setPoints[teams[0][1]] += setsWon0 - setsWon1
      setPoints[teams[1][0]] += setsWon1 - setsWon0
      setPoints[teams[1][1]] += setsWon1 - setsWon0
    }
  }
  return setPoints
}

export const calculateRanking = (
  participants: Player[],
  history: History
): Ranking => {
  let points = calculatePoints(participants, history)
  let buchholz = calculateBuchholz(points, history)
  let setPoints = calculateSetPoints(participants, history)
  let ranking: Ranking = participants.map((participant) => [
    participant,
    points[participant],
    buchholz[participant],
    setPoints[participant],
  ])
  return ranking.sort(
    (here, there) =>
      there[1] - here[1] || there[2] - here[2] || there[3] - here[3]
  )
}

export const sortTeamsByRanking = (teams: Team[], ranking: Ranking): Team[] => {
  const rankingMap: Record<Player, [Points, Buchholz, SetPoints]> = {}
  for (const [player, points, buchholz, setPoints] of ranking) {
    rankingMap[player] = [points, buchholz, setPoints]
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
