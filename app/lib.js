// history is an array of rounds.
// Each round in history is an array of matches.
// Each regular match has the following structure:
//
// {
//   teams: [["Player1", "Player2"], ["Player3", "Player4"]],
//   winningTeam: 0,
// }
//
// where the value of winningTeam indicates the index of the winning team in
// teams field.
// matches representing freegames have the following structure:
//
// {
//   isFreeGame: true,
//   player: "Player1",
// }
//

const tournamentHasStarted = (history) => isTruthy(history)

const drawSetting = (participants) => shuffle(participants)

const tournamentHasFinished = (history, roundCount) => {
  return history.length == roundCount && !roundIsOpen(history[roundCount - 1])
}

const roundIsOpen = (round) => round.some((match) => match.winningTeam === null)

const calculateCurrentRound = () => {
  // which round is current round, 1-indexed
  const history = load('history')
  return history.length
}

const determineNextRound = (participants, history) => {
  const ranking = calculateRanking(participants, history)
  const rankingObject = Object.fromEntries(ranking)
  const forbiddenPairings = calculateForbiddenPairings(participants, history)
  const freeGamers = calculateFreeGamers(participants, history)
  const pairings = drawPairings(
    participants,
    forbiddenPairings,
    freeGamers
  ).sort((team) => rankingObject[team[0]] + rankingObject[team[1]])
  let matches = []
  for (let i = 0; i < pairings.length; i += 2) {
    matches.push({
      teams: [pairings[i], pairings[i + 1]],
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

const calculateForbiddenPairings = (participants, history) => {
  let forbiddenPartners = {}
  for (const participant of participants) {
    forbiddenPartners[participant] = new Set([participant])
  }
  for (const round of history) {
    for (const match of round) {
      if (match.isFreeGame) {
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

const drawPairings = (participants, forbiddenPairings, freeGamers) => {
  participants = new Set(participants)
  const players = setDiff(participants, freeGamers)
  let pairings = []
  while (players.size > 0) {
    const [playerOne] = players
    players.delete(playerOne)
    const possiblePartners = setDiff(players, forbiddenPairings[playerOne])
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

const calculateFreeGamers = (participants, history) => {
  // Participants with the lowest ranking who have not yet had a free game will
  // get a free game.
  let ranking = calculateRanking(participants, history)
  const participantCount = participants.length
  const freeGamesCount = participantCount % 4
  let freeGamers = new Set([])
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

const playerHadFreeGame = (player, history) => {
  for (const round of history) {
    for (const match of round) {
      if (!match.isFreeGame) {
        continue
      }
      if (match.player == player) {
        return true
      }
    }
  }
  return false
}

const calculatePoints = (participants, history) => {
  // Returns sorted array of tuple [player, points] buchholz, 2nd-buchholz]
  let ranking = {}
  for (const participant of participants) {
    ranking[participant] = 0
  }
  for (const round of history) {
    if (roundIsOpen(round)) {
      continue
    }
    for (const match of round) {
      if (match.isFreeGame) {
        ranking[match.player] += 1
        continue
      }
      for (const winningPlayer of match.teams[match.winningTeam]) {
        ranking[winningPlayer] += 1
      }
    }
  }
  return ranking
}

const calculateBuchholz = (points, history) => {
  const buchholz = {}
  for (const player of Object.keys(points)) {
    buchholz[player] = 0
  }

  for (const round of history) {
    if (roundIsOpen(round)) {
      continue
    }
    for (const match of round) {
      if (match.isFreeGame) {
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

const calculateRanking = (participants, history) => {
  // Returns sorted array of tuples [player, points, buchholz]
  let points = calculatePoints(participants, history)
  let buchholz = calculateBuchholz(points, history)
  let ranking = participants.map((participant) => [
    participant,
    points[participant],
    buchholz[participant],
  ])
  return ranking.sort((here, there) => there[1] - here[1] || there[2] - here[2])
}

const resetNextRound = (history, setting, roundCount) => {
  history.pop()
  dump('history', history)
  setNextRound(history, setting, roundCount)
}

const setNextRound = (history, setting, roundCount) => {
  if (calculateCurrentRound() == roundCount) return
  dump('history', [...history, determineNextRound(setting, history)])
}

/* Exporting functions for testing */
if (typeof exports !== 'undefined') {
  exports.calculateRanking = calculateRanking
  exports.calculatePoints = calculatePoints
  exports.calculateBuchholz = calculateBuchholz
  exports.tournamentHasStarted = tournamentHasStarted
  exports.playerHadFreeGame = playerHadFreeGame
  exports.calculateFreeGamers = calculateFreeGamers
}
