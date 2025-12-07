import type { Team, Ranking } from './types.js'
import { RegularMatch } from './types.js'
import { sortTeamsByRanking } from './ranking.js'

export type PairingStrategy = 'power-pairing' | 'random'

// Default pairing strategy for backwards compatibility with tournaments
// created before the pairingStrategy feature was introduced
export const DEFAULT_PAIRING_STRATEGY: PairingStrategy = 'power-pairing'

export const pairTeams = (
  teams: Team[],
  ranking: Ranking,
  strategy: PairingStrategy = DEFAULT_PAIRING_STRATEGY
): RegularMatch[] => {
  if (strategy === 'random') {
    return pairTeamsRandomly(teams)
  } else {
    return pairTeamsByPower(teams, ranking)
  }
}

const pairTeamsByPower = (teams: Team[], ranking: Ranking): RegularMatch[] => {
  teams = sortTeamsByRanking(teams, ranking)
  let matches: RegularMatch[] = []
  for (let i = 0; i < teams.length; i += 2) {
    matches.push(
      new RegularMatch([teams[i] as Team, teams[i + 1] as Team], [null, null])
    )
  }
  return matches
}

const pairTeamsRandomly = (teams: Team[]): RegularMatch[] => {
  const shuffled = [...teams]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  let matches: RegularMatch[] = []
  for (let i = 0; i < shuffled.length; i += 2) {
    matches.push(
      new RegularMatch(
        [shuffled[i] as Team, shuffled[i + 1] as Team],
        [null, null]
      )
    )
  }
  return matches
}
