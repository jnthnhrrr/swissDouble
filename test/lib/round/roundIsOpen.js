import { expect } from 'chai'
import { roundIsOpen } from '../../../dist/round.js'

describe('roundIsOpen', () => {
  describe('when round contains free games', () => {
    it('returns true if any winningTeam is null', () => {
      const round = [
        {
          teams: [
            ['Player1', 'Player2'],
            ['Player3', 'Player4'],
          ],
          winningTeam: null,
        },
        {
          teams: [
            ['Player5', 'Player6'],
            ['Player7', 'Player8'],
          ],
          winningTeam: 1,
        },
        {
          isFreeGame: true,
          player: 'Player9',
        },
      ]

      expect(roundIsOpen(round)).to.be.true
    })

    it('returns false if all winningTeams are determined', () => {
      const round = [
        {
          teams: [
            ['Player1', 'Player2'],
            ['Player3', 'Player4'],
          ],
          winningTeam: 0,
        },
        {
          teams: [
            ['Player5', 'Player6'],
            ['Player7', 'Player8'],
          ],
          winningTeam: 1,
        },
        {
          isFreeGame: true,
          player: 'Player9',
        },
      ]

      expect(roundIsOpen(round)).to.be.false
    })
  })
})
