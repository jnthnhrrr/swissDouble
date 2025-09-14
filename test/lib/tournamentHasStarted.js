let expect = require('chai').expect
let lib = require('../../app/lib')
let utils = require('../../app/utils')

describe('tournamentHasStarted', () => {
  before(() => {
    global.isTruthy = utils.isTruthy
  })

  describe('when there is no history', () => {
    it('returns false for undefined', () => {
      const result = lib.tournamentHasStarted(undefined)
      expect(result).to.be.false
    })

    it('returns false for empty array', () => {
      const result = lib.tournamentHasStarted([])
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
      const result = lib.tournamentHasStarted(history)
      expect(result).to.be.true
    })
  })
})
