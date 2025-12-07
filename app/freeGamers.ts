import type { History, Ranking, Player, FreeGameStrategy } from './types.js'
import { calculateRanking, getRankingOrder } from './ranking.js'
import { drawRandom } from './utils.js'

// Default free game strategy for backwards compatibility with tournaments
// created before the freeGameStrategy feature was introduced
export const DEFAULT_FREE_GAME_STRATEGY: FreeGameStrategy = 'bottom-ranking'

const getFreeGameCount = (player: Player, history: History): number => {
  let count = 0
  for (const round of history) {
    for (const match of round) {
      if (!('isFreeGame' in match)) {
        continue
      }
      if (match.player == player) {
        count++
      }
    }
  }
  return count
}

const selectByRanking = (
  eligiblePlayers: Player[],
  ranking: Ranking,
  count: number
): Player[] => {
  const rankingMap = new Map<Player, number>()
  for (let i = 0; i < ranking.length; i++) {
    rankingMap.set(ranking[i][0], i)
  }

  const sortedEligible = [...eligiblePlayers].sort((a, b) => {
    const rankA = rankingMap.get(a) ?? Infinity
    const rankB = rankingMap.get(b) ?? Infinity
    return rankA - rankB
  })

  return sortedEligible.slice(0, count)
}

const selectRandom = (eligiblePlayers: Player[], count: number): Player[] => {
  const selected: Player[] = []
  const available = new Set(eligiblePlayers)

  for (let i = 0; i < count && available.size > 0; i++) {
    const player = drawRandom(available)
    selected.push(player)
    available.delete(player)
  }

  return selected
}

export const calculateFreeGamers = (
  participants: Player[],
  history: History,
  strategy: FreeGameStrategy = DEFAULT_FREE_GAME_STRATEGY
): Player[] => {
  const rankingOrder = getRankingOrder()
  let ranking: Ranking = calculateRanking(participants, history, rankingOrder)
  const participantCount = participants.length
  const freeGamesCount = participantCount % 4
  let freeGamers: Player[] = []
  if (freeGamesCount == 0) {
    return freeGamers
  }

  const freeGameCounts: Record<Player, number> = {}
  for (const participant of participants) {
    freeGameCounts[participant] = getFreeGameCount(participant, history)
  }

  const minFreeGames = Math.min(...Object.values(freeGameCounts))

  const eligiblePlayers: Player[] = []
  for (const [player, _] of ranking.reverse()) {
    if (freeGameCounts[player] === minFreeGames) {
      eligiblePlayers.push(player)
    }
  }

  if (strategy === 'random') {
    return selectRandom(eligiblePlayers, freeGamesCount)
  } else {
    return selectByRanking(eligiblePlayers, ranking, freeGamesCount)
  }
}
