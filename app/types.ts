import { load } from './storage.js'

export type Player = string
export type Team = [Player, Player]

export class RegularMatch {
  teams: [Team, Team]
  setsWon: [number | null, number | null]

  constructor(
    teams: [Team, Team],
    setsWon: [number | null, number | null] = [null, null]
  ) {
    this.teams = teams
    this.setsWon = setsWon
  }

  get winningTeam(): 0 | 1 | null {
    if (this.setsWon[0] === null || this.setsWon[1] === null) {
      return null
    }
    const setsToWin = load('setsToWin', 1) as number
    if (this.setsWon[0] === setsToWin && this.setsWon[1] !== setsToWin) return 0
    if (this.setsWon[1] === setsToWin && this.setsWon[0] !== setsToWin) return 1
    return null
  }

  static fromPlainObject(obj: {
    teams: [Team, Team]
    setsWon?: [number | null, number | null]
    winningTeam?: 0 | 1 | null
  }): RegularMatch {
    if (obj.setsWon !== undefined) {
      return new RegularMatch(obj.teams, obj.setsWon)
    } else if (obj.winningTeam !== undefined && obj.winningTeam !== null) {
      const setsWon: [number | null, number | null] =
        obj.winningTeam === 0 ? [1, 0] : [0, 1]
      return new RegularMatch(obj.teams, setsWon)
    } else {
      return new RegularMatch(obj.teams, [null, null])
    }
  }

  toJSON() {
    return {
      teams: this.teams,
      setsWon: this.setsWon,
    }
  }
}

export interface FreeGameMatch {
  isFreeGame: true
  player: Player
  winningTeam?: never
}

export type Match = RegularMatch | FreeGameMatch
export type Round = Match[]
export type History = Round[]

export type Points = number
export type Buchholz = number
export type SetPoints = number
export type RankingRow = [Player, Points, Buchholz, SetPoints]
export type Ranking = RankingRow[]

export type DepartedPlayersRecord = Record<Player, number>

export type FreeGameStrategy = 'bottom-ranking' | 'random'
export type PairingStrategy = 'power-pairing' | 'random'
export type RankingParameter = 'points' | 'setPoints' | 'buchholz'
export type RankingOrder = RankingParameter[]

export type TournamentTitle = string
export interface Tournament {
  title: TournamentTitle
  history: History
  participants: Player[]
  roundCount: number
  departedPlayers: DepartedPlayersRecord
  freeGameStrategy: FreeGameStrategy
  pairingStrategy: PairingStrategy
  setsToWin?: number
  rankingOrder?: RankingOrder
}
