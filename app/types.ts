export type Player = string
export type Team = [Player, Player]

export interface RegularMatch {
  teams: [Team, Team]
  winningTeam: 0 | 1 | null
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
export type RankingRow = [Player, Points, Buchholz]
export type Ranking = RankingRow[]

export type DepartedPlayersRecord = Record<Player, number>

export type TournamentTitle = string
export interface Tournament {
  title: TournamentTitle
  history: History
  participants: Player[]
  setting: Player[]
  roundCount: number
  departedPlayers: DepartedPlayersRecord
}
