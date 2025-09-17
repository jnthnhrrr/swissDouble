import { expect } from 'chai'
import { tournamentHasStarted } from '../../../dist/tournament.js'

describe('tournamentHasStarted', () => {
  describe('when there is no history', () => {
    it('returns false for undefined', () => {
      const result = tournamentHasStarted(undefined)
      expect(result).to.be.false
    })

    it('returns false for empty array', () => {
      const result = tournamentHasStarted([])
      expect(result).to.be.false
    })
  })

  describe('when history is truthy', () => {
    it('returns true for array with rounds', () => {
      const history = [
        [
          {
            teams: [
              ['Player1', 'Player2'],
              ['Player3', 'Player4'],
            ],
            winningTeam: 0,
          },
        ],
      ]
      const result = tournamentHasStarted(history)
      expect(result).to.be.true
    })
  })
})
