import type { History, Ranking, Player } from './types.js'
import { calculateRanking } from './ranking.js'

export const calculateFreeGamers = (
  participants: Player[],
  history: History
): Player[] => {
  // Participants with the lowest ranking who have not yet had a free game will
  // get a free game.
  let ranking: Ranking = calculateRanking(participants, history)
  const participantCount = participants.length
  const freeGamesCount = participantCount % 4
  let freeGamers: Player[] = []
  if (freeGamesCount == 0) {
    return freeGamers
  }
  for (const [player, _] of ranking.reverse()) {
    if (!playerHadFreeGame(player, history)) {
      freeGamers.push(player)
    }
    if (freeGamers.length == freeGamesCount) {
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
