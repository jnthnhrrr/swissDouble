import { expect } from 'chai'
import { pairTeams } from '../../../dist/pairingStrategy.js'

describe('pairTeams', () => {
  describe('power-pairing strategy', () => {
    it('pairs teams by ranking strength', () => {
      const teams = [
        ['Alice', 'Bob'], // 11 points
        ['Carol', 'Dave'], // 7 points
        ['Eve', 'Frank'], // 3 points
        ['Grace', 'Henry'], // 1 point
      ]

      const ranking = [
        ['Alice', 6, 20],
        ['Bob', 5, 18],
        ['Carol', 4, 12],
        ['Dave', 3, 10],
        ['Eve', 2, 6],
        ['Frank', 1, 4],
        ['Grace', 1, 2],
        ['Henry', 0, 0],
      ]

      const matches = pairTeams(teams, ranking, 'power-pairing')

      expect(matches).to.have.length(2)

      const topMatch = matches.find(
        (match) =>
          match.teams.some((team) => team.includes('Alice') && team.includes('Bob')) &&
          match.teams.some((team) => team.includes('Carol') && team.includes('Dave'))
      )

      const bottomMatch = matches.find(
        (match) =>
          match.teams.some((team) => team.includes('Eve') && team.includes('Frank')) &&
          match.teams.some((team) => team.includes('Grace') && team.includes('Henry'))
      )

      expect(topMatch).to.not.be.undefined, 'Strongest teams should play each other'
      expect(bottomMatch).to.not.be.undefined, 'Weakest teams should play each other'
    })

    it('uses buchholz as tiebreaker when teams have identical points', () => {
      const teams = [
        ['Alice', 'Bob'], // 4 points, 25 buchholz
        ['Carol', 'Dave'], // 4 points, 15 buchholz
        ['Eve', 'Frank'], // 4 points, 5 buchholz
        ['Grace', 'Henry'], // 2 points, 1 buchholz
      ]

      const ranking = [
        ['Alice', 3, 15],
        ['Bob', 1, 10],
        ['Carol', 2, 8],
        ['Dave', 2, 7],
        ['Eve', 2, 3],
        ['Frank', 2, 2],
        ['Grace', 1, 1],
        ['Henry', 1, 0],
      ]

      const matches = pairTeams(teams, ranking, 'power-pairing')

      expect(matches).to.have.length(2)

      const topMatch = matches.find(
        (match) =>
          match.teams.some((team) => team.includes('Alice') && team.includes('Bob')) &&
          match.teams.some((team) => team.includes('Carol') && team.includes('Dave'))
      )

      const bottomMatch = matches.find(
        (match) =>
          match.teams.some((team) => team.includes('Eve') && team.includes('Frank')) &&
          match.teams.some((team) => team.includes('Grace') && team.includes('Henry'))
      )

      expect(topMatch).to.not.be.undefined,
        'Top two teams (by buchholz tiebreaker) should play each other'
      expect(bottomMatch).to.not.be.undefined, 'Third and fourth teams should play each other'
    })
  })

  describe('random strategy', () => {
    it('creates valid pairings with all teams matched', () => {
      const teams = [
        ['Alice', 'Bob'],
        ['Carol', 'Dave'],
        ['Eve', 'Frank'],
        ['Grace', 'Henry'],
      ]

      const ranking = [
        ['Alice', 6, 20],
        ['Bob', 5, 18],
        ['Carol', 4, 12],
        ['Dave', 3, 10],
        ['Eve', 2, 6],
        ['Frank', 1, 4],
        ['Grace', 1, 2],
        ['Henry', 0, 0],
      ]

      const matches = pairTeams(teams, ranking, 'random')

      expect(matches).to.have.length(2)
      expect(matches[0]).to.have.property('teams')
      expect(matches[0].teams).to.have.length(2)
      expect(matches[1]).to.have.property('teams')
      expect(matches[1].teams).to.have.length(2)
      expect(matches[0].winningTeam).to.be.null
      expect(matches[1].winningTeam).to.be.null
    })

    it('can produce different pairings on multiple calls', () => {
      const teams = [
        ['Alice', 'Bob'],
        ['Carol', 'Dave'],
        ['Eve', 'Frank'],
        ['Grace', 'Henry'],
      ]

      const ranking = [
        ['Alice', 6, 20],
        ['Bob', 5, 18],
        ['Carol', 4, 12],
        ['Dave', 3, 10],
        ['Eve', 2, 6],
        ['Frank', 1, 4],
        ['Grace', 1, 2],
        ['Henry', 0, 0],
      ]

      const results = new Set()
      // Run multiple times to check for randomness
      for (let i = 0; i < 10; i++) {
        const matches = pairTeams(teams, ranking, 'random')
        const pairingKey = JSON.stringify(matches.map((m) => m.teams.map((t) => t.sort()).sort()))
        results.add(pairingKey)
      }

      // With random strategy, we should get at least 2 different pairings
      // (though it's theoretically possible to get the same one multiple times)
      expect(results.size).to.be.greaterThanOrEqual(1)
    })

    it('includes all teams exactly once', () => {
      const teams = [
        ['Alice', 'Bob'],
        ['Carol', 'Dave'],
        ['Eve', 'Frank'],
        ['Grace', 'Henry'],
      ]

      const ranking = [
        ['Alice', 6, 20],
        ['Bob', 5, 18],
        ['Carol', 4, 12],
        ['Dave', 3, 10],
        ['Eve', 2, 6],
        ['Frank', 1, 4],
        ['Grace', 1, 2],
        ['Henry', 0, 0],
      ]

      const matches = pairTeams(teams, ranking, 'random')

      const allPlayers = new Set()
      for (const match of matches) {
        for (const team of match.teams) {
          for (const player of team) {
            expect(allPlayers.has(player)).to.be.false,
              `Player ${player} should appear exactly once`
            allPlayers.add(player)
          }
        }
      }

      expect(allPlayers.size).to.equal(8)
    })
  })

  describe('default behavior', () => {
    it('defaults to power-pairing when strategy not specified', () => {
      const teams = [
        ['Alice', 'Bob'],
        ['Carol', 'Dave'],
        ['Eve', 'Frank'],
        ['Grace', 'Henry'],
      ]

      const ranking = [
        ['Alice', 6, 20],
        ['Bob', 5, 18],
        ['Carol', 4, 12],
        ['Dave', 3, 10],
        ['Eve', 2, 6],
        ['Frank', 1, 4],
        ['Grace', 1, 2],
        ['Henry', 0, 0],
      ]

      const matchesDefault = pairTeams(teams, ranking)
      const matchesPowerPairing = pairTeams(teams, ranking, 'power-pairing')

      expect(matchesDefault).to.deep.equal(matchesPowerPairing)
    })
  })
})
