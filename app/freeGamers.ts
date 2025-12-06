import type { History, Ranking, Player } from './types.js'
import { calculateRanking } from './ranking.js'

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

export const calculateFreeGamers = (
  participants: Player[],
  history: History
): Player[] => {
  let ranking: Ranking = calculateRanking(participants, history)
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

  for (const [player, _] of ranking.reverse()) {
    if (freeGameCounts[player] === minFreeGames) {
      freeGamers.push(player)
    }
    if (freeGamers.length == freeGamesCount) {
      return freeGamers
    }
  }

  return freeGamers
}
