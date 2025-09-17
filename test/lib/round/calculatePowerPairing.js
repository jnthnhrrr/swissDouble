import { expect } from 'chai'
import { calculatePowerPairing } from '../../../dist/round.js'

describe('calculatePowerPairing', () => {
  describe('power pairing logic', () => {
    it('pairs teams by ranking - clear team strength differences', () => {
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

      const matches = calculatePowerPairing(teams, ranking)

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

    it('handles teams with identical combined points using buchholz as tiebreaker', () => {
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

      const matches = calculatePowerPairing(teams, ranking)

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

    it('handles complex team ranking scenario with mixed individual performances', () => {
      const ranking = [
        ['Sarah', 6, 20],
        ['John', 5, 18],
        ['Emma', 4, 16],
        ['Lisa', 3, 12],
        ['Tom', 3, 10],
        ['Ben', 2, 5],
        ['Kate', 1, 3],
        ['Mike', 0, 0],
      ]

      const teams = [
        ['Sarah', 'Mike'], // 6 points, 20 buchholz
        ['Lisa', 'Tom'], // 6 points, 22 buchholz
        ['John', 'Emma'], // 9 points, 34 buchholz
        ['Kate', 'Ben'], // 3 points, 8 buchholz
      ]

      const matches = calculatePowerPairing(teams, ranking)

      expect(matches).to.have.length(2)

      const topMatch = matches.find(
        (match) =>
          match.teams.some((team) => team.includes('John') && team.includes('Emma')) &&
          match.teams.some((team) => team.includes('Lisa') && team.includes('Tom'))
      )

      const bottomMatch = matches.find(
        (match) =>
          match.teams.some((team) => team.includes('Sarah') && team.includes('Mike')) &&
          match.teams.some((team) => team.includes('Kate') && team.includes('Ben'))
      )

      expect(topMatch).to.not.be.undefined,
        'Strongest team should play against second strongest (by buchholz tiebreaker)'
      expect(bottomMatch).to.not.be.undefined,
        'Third team (lower buchholz) should play against weakest team'
    })
  })
})
