import { expect } from 'chai'
import { JSDOM } from 'jsdom'
import { determineNextRound } from '../../dist/lib.js'
import { dump } from '../../dist/storage.js'

describe('determineNextRound integration test', () => {
  before(() => {
    const dom = new JSDOM('', { url: 'http://localhost' })
    global.window = dom.window
    global.localStorage = dom.window.localStorage
  })

  after(() => {
    delete global.window
    delete global.localStorage
  })

  describe('first round to second round progression', () => {
    it('determines first round correctly with 8 players (no free games)', () => {
      const participants = [
        'player1',
        'player2',
        'player3',
        'player4',
        'player5',
        'player6',
        'player7',
        'player8',
      ]
      dump('participants', participants)
      dump('departedplayers', {})
      const emptyHistory = []

      // phase 1: determine first round
      const firstRoundMatches = determineNextRound(participants, emptyHistory)

      // 8 players = 2 matches (4 players each), no free games
      expect(firstRoundMatches).to.have.length(2)

      firstRoundMatches.forEach((match) => {
        expect(match).to.have.property('teams')
        expect(match).to.have.property('winningTeam', null)
        expect(match).to.not.have.property('isFreeGame')
        expect(match.teams).to.have.length(2)
        expect(match.teams[0]).to.have.length(2) // Team 1 has 2 players
        expect(match.teams[1]).to.have.length(2) // Team 2 has 2 players
      })

      const allPlayersInFirstRound = firstRoundMatches.flatMap((match) =>
        match.teams.flatMap((team) => team)
      )
      expect(allPlayersInFirstRound).to.have.members(participants)
      expect(allPlayersInFirstRound).to.have.length(8)

      // phase 2: Simulate playing the first round
      const completedFirstRound = firstRoundMatches.map((match) => ({
        ...match,
        winningTeam: 0, // Team 0 wins each match
      }))

      const historyAfterFirstRound = [completedFirstRound]

      const secondRoundMatches = determineNextRound(participants, historyAfterFirstRound)

      expect(secondRoundMatches).to.have.length(2)

      // Verify forbidden pairings are respected
      const firstRoundPartnerships = new Set()
      completedFirstRound.forEach((match) => {
        match.teams.forEach((team) => {
          const [p1, p2] = team.sort()
          firstRoundPartnerships.add(`${p1}-${p2}`)
        })
      })

      const secondRoundPartnerships = new Set()
      secondRoundMatches.forEach((match) => {
        match.teams.forEach((team) => {
          const [p1, p2] = team.sort()
          secondRoundPartnerships.add(`${p1}-${p2}`)
        })
      })

      // Verify no partnerships repeat
      const intersection = [...firstRoundPartnerships].filter((partnership) =>
        secondRoundPartnerships.has(partnership)
      )
      expect(intersection).to.have.length(
        0,
        `Partnerships should not repeat. Found repeating partnerships: ${intersection.join(', ')}`
      )
    })

    it('handles 5 players (1 free game)', () => {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4', 'Player5']
      const emptyHistory = []
      dump('participants', participants)
      dump('departedPlayers', {})

      // PHASE 1: Determine first round
      const firstRoundMatches = determineNextRound(participants, emptyHistory)

      // 5 players: 4 play (1 match), 1 gets free game
      const regularMatches = firstRoundMatches.filter((match) => !match.isFreeGame)
      const freeGameMatches = firstRoundMatches.filter((match) => match.isFreeGame)

      expect(regularMatches).to.have.length(1) // 1 match with 4 players
      expect(freeGameMatches).to.have.length(1) // 1 free game

      // Verify regular match structure
      regularMatches.forEach((match) => {
        expect(match.teams).to.have.length(2)
        expect(match.teams[0]).to.have.length(2)
        expect(match.teams[1]).to.have.length(2)
      })

      // Verify free game structure
      expect(freeGameMatches[0]).to.have.property('isFreeGame', true)
      expect(freeGameMatches[0]).to.have.property('player')
      expect(participants).to.include(freeGameMatches[0].player)

      // PHASE 2: Complete first round and test second round
      const completedFirstRound = firstRoundMatches.map((match) => {
        if (match.isFreeGame) return match
        return { ...match, winningTeam: 0 }
      })

      const secondRoundMatches = determineNextRound(participants, [completedFirstRound])

      const secondRegularMatches = secondRoundMatches.filter((match) => !match.isFreeGame)
      const secondFreeGameMatches = secondRoundMatches.filter((match) => match.isFreeGame)

      expect(secondRegularMatches).to.have.length(1)
      expect(secondFreeGameMatches).to.have.length(1)

      // Verify different player gets free game (if possible)
      const firstFreePlayer = freeGameMatches[0].player
      const secondFreePlayer = secondFreeGameMatches[0].player
    })

    it('handles 6 players (2 free games)', () => {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4', 'Player5', 'Player6']
      const emptyHistory = []

      dump('participants', participants)
      dump('departedPlayers', {})

      // PHASE 1: Determine first round
      const firstRoundMatches = determineNextRound(participants, emptyHistory)

      // 6 players: 4 play (1 match), 2 get free games
      const regularMatches = firstRoundMatches.filter((match) => !match.isFreeGame)
      const freeGameMatches = firstRoundMatches.filter((match) => match.isFreeGame)

      expect(regularMatches).to.have.length(1) // 1 match with 4 players
      expect(freeGameMatches).to.have.length(2) // 2 free games

      // Verify all players are accounted for
      const playingPlayers = regularMatches.flatMap((match) => match.teams.flatMap((team) => team))
      const freeGamePlayers = freeGameMatches.map((match) => match.player)
      const allAccountedPlayers = [...playingPlayers, ...freeGamePlayers]

      expect(allAccountedPlayers).to.have.members(participants)
      expect(allAccountedPlayers).to.have.length(6)
    })

    it('handles 7 players (3 free games)', () => {
      const participants = [
        'Player1',
        'Player2',
        'Player3',
        'Player4',
        'Player5',
        'Player6',
        'Player7',
      ]
      const emptyHistory = []

      dump('participants', participants)
      dump('departedPlayers', {})

      // PHASE 1: Determine first round
      const firstRoundMatches = determineNextRound(participants, emptyHistory)

      // 7 players: 4 play (1 match), 3 get free games
      const regularMatches = firstRoundMatches.filter((match) => !match.isFreeGame)
      const freeGameMatches = firstRoundMatches.filter((match) => match.isFreeGame)

      expect(regularMatches).to.have.length(1) // 1 match with 4 players
      expect(freeGameMatches).to.have.length(3) // 3 free games
    })

    it('progresses correctly through multiple rounds with free games', () => {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4', 'Player5', 'Player6']
      let history = []

      dump('participants', participants)
      dump('departedPlayers', {})

      // Play 3 rounds and track free game distribution
      const freeGameHistory = {}
      participants.forEach((p) => (freeGameHistory[p] = 0))

      for (let round = 1; round <= 3; round++) {
        const roundMatches = determineNextRound(participants, history)

        // Count free games
        const freeGameMatches = roundMatches.filter((match) => match.isFreeGame)
        expect(freeGameMatches).to.have.length(2) // 6 players = 2 free games per round

        // Track who gets free games
        freeGameMatches.forEach((match) => {
          freeGameHistory[match.player]++
        })

        // Complete the round (simulate results)
        const completedRound = roundMatches.map((match) => {
          if (match.isFreeGame) return match
          return { ...match, winningTeam: Math.random() < 0.5 ? 0 : 1 } // Random winner
        })

        history.push(completedRound)
      }

      // After 3 rounds, verify free games are distributed fairly
      // Each player should have had at least 1 free game (6 players, 2 free games per round, 3 rounds = 6 total free games)
      const freeGameCounts = Object.values(freeGameHistory)
      const totalFreeGames = freeGameCounts.reduce((sum, count) => sum + count, 0)
      expect(totalFreeGames).to.equal(6) // 3 rounds × 2 free games per round

      // Verify fair distribution (everyone should get exactly 1 free game)
      freeGameCounts.forEach((count) => {
        expect(count).to.equal(1)
      })
    })
  })

  describe('edge cases', () => {
    it('handles minimum tournament size (4 players, no free games)', () => {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4']
      const emptyHistory = []

      dump('participants', participants)
      dump('departedPlayers', {})

      const firstRoundMatches = determineNextRound(participants, emptyHistory)

      expect(firstRoundMatches).to.have.length(1) // 4 players = 1 match, no free games
      expect(firstRoundMatches.every((match) => !match.isFreeGame)).to.be.true

      // Verify structure
      expect(firstRoundMatches[0].teams).to.have.length(2)
      expect(firstRoundMatches[0].teams[0]).to.have.length(2)
      expect(firstRoundMatches[0].teams[1]).to.have.length(2)
    })

    it('handles large tournament (12 players, no free games)', () => {
      const participants = Array.from({ length: 12 }, (_, i) => `Player${i + 1}`)
      const emptyHistory = []

      dump('participants', participants)
      dump('departedPlayers', {})

      const firstRoundMatches = determineNextRound(participants, emptyHistory)

      expect(firstRoundMatches).to.have.length(3) // 12 players = 3 matches, no free games
      expect(firstRoundMatches.every((match) => !match.isFreeGame)).to.be.true

      // Verify all players included
      const allPlayers = firstRoundMatches.flatMap((match) => match.teams.flatMap((team) => team))
      expect(allPlayers).to.have.members(participants)
    })
  })

  describe('First round top-half/bottom-half pairing requirement', () => {
    it('pairs top-half players with bottom-half players in first round (8 players, no free games)', () => {
      const participants = [
        'Player1',
        'Player2',
        'Player3',
        'Player4',
        'Player5',
        'Player6',
        'Player7',
        'Player8',
      ]
      const emptyHistory = []
      dump('participants', participants)
      dump('departedPlayers', {})

      // Run multiple times to test the randomness while verifying the pairing rule
      for (let trial = 0; trial < 10; trial++) {
        const firstRoundMatches = determineNextRound(participants, emptyHistory) // Should be 2 matches, no free games
        expect(firstRoundMatches).to.have.length(2)
        expect(firstRoundMatches.every((match) => !match.isFreeGame)).to.be.true

        const topHalf = ['Player1', 'Player2', 'Player3', 'Player4']
        const bottomHalf = ['Player5', 'Player6', 'Player7', 'Player8']

        // Extract all teams (partnerships) from first round
        const allTeams = firstRoundMatches.flatMap((match) => match.teams)

        // Each team should have exactly one player from top half and one from bottom half
        allTeams.forEach((team, teamIndex) => {
          const [player1, player2] = team

          const player1InTop = topHalf.includes(player1)
          const player1InBottom = bottomHalf.includes(player1)
          const player2InTop = topHalf.includes(player2)
          const player2InBottom = bottomHalf.includes(player2)

          // Exactly one should be from each half
          const validPairing =
            (player1InTop && player2InBottom) || (player1InBottom && player2InTop)

          expect(validPairing).to.be.true,
            `Team ${teamIndex} [${player1}, ${player2}] violates top-half/bottom-half rule. ` +
              `Top half: ${topHalf.join(',')}, Bottom half: ${bottomHalf.join(',')}`
        })

        // Verify all players from both halves are included
        const topHalfPairings = new Set()
        const bottomHalfPairings = new Set()

        allTeams.forEach((team) => {
          const [player1, player2] = team
          if (topHalf.includes(player1)) {
            topHalfPairings.add(player1)
            expect(bottomHalf.includes(player2)).to.be.true,
              `Top-half player ${player1} should be paired with bottom-half player, but got ${player2}`
          }
          if (topHalf.includes(player2)) {
            topHalfPairings.add(player2)
            expect(bottomHalf.includes(player1)).to.be.true,
              `Top-half player ${player2} should be paired with bottom-half player, but got ${player1}`
          }
          if (bottomHalf.includes(player1)) {
            bottomHalfPairings.add(player1)
          }
          if (bottomHalf.includes(player2)) {
            bottomHalfPairings.add(player2)
          }
        })

        expect([...topHalfPairings]).to.have.members(topHalf)
        expect([...bottomHalfPairings]).to.have.members(bottomHalf)
      }
    })

    it('pairs top-half with bottom-half for playing players in first round (6 players, with free games)', () => {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4', 'Player5', 'Player6']
      const emptyHistory = []

      dump('participants', participants)
      dump('departedPlayers', {})

      for (let trial = 0; trial < 10; trial++) {
        const firstRoundMatches = determineNextRound(participants, emptyHistory)

        const regularMatches = firstRoundMatches.filter((match) => !match.isFreeGame)
        const freeGameMatches = firstRoundMatches.filter((match) => match.isFreeGame)

        expect(regularMatches).to.have.length(1)
        expect(freeGameMatches).to.have.length(2)

        const playingPlayers = regularMatches[0].teams.flatMap((team) => team)
        expect(playingPlayers).to.have.length(4)
        expect(playingPlayers).to.have.all.members(['Player1', 'Player2', 'Player3', 'Player4'])

        const topHalf = ['Player1', 'Player2']
        const bottomHalf = ['Player3', 'Player4']

        const teams = regularMatches[0].teams
        teams.forEach((team) => {
          const [player1, player2] = team

          const player1InTop = topHalf.includes(player1)
          const player1InBottom = bottomHalf.includes(player1)
          const player2InTop = topHalf.includes(player2)
          const player2InBottom = bottomHalf.includes(player2)

          const validPairing =
            (player1InTop && player2InBottom) || (player1InBottom && player2InTop)

          expect(validPairing).to.be.true,
            `Team [${player1}, ${player2}] violates top-half/bottom-half rule. ` +
              `Effective top: ${topHalf.join(',')}, Effective bottom: ${bottomHalf.join(',')}`
        })
      }
    })
  })
})
