import { expect } from 'chai'
import { JSDOM } from 'jsdom'
import { RegularMatch } from '../../../dist/types.js'
import { dump } from '../../../dist/storage.js'

describe('Sets Validation', () => {
  before(() => {
    const dom = new JSDOM('', { url: 'http://localhost' })
    global.window = dom.window
    global.localStorage = dom.window.localStorage
  })

  after(() => {
    delete global.window
    delete global.localStorage
  })

  beforeEach(() => {
    localStorage.clear()
  })

  describe('winningTeam validation', () => {
    it('validates that one team has exactly setsToWin sets', () => {
      dump('setsToWin', 3)
      const match1 = new RegularMatch(
        [
          ['Player1', 'Player2'],
          ['Player3', 'Player4'],
        ],
        [3, 1]
      )
      expect(match1.winningTeam).to.equal(0)

      const match2 = new RegularMatch(
        [
          ['Player1', 'Player2'],
          ['Player3', 'Player4'],
        ],
        [1, 3]
      )
      expect(match2.winningTeam).to.equal(1)
    })

    it('returns null when no team has setsToWin sets', () => {
      dump('setsToWin', 3)
      const match = new RegularMatch(
        [
          ['Player1', 'Player2'],
          ['Player3', 'Player4'],
        ],
        [1, 1]
      )
      expect(match.winningTeam).to.be.null
    })

    it('returns null when both teams have setsToWin sets (invalid)', () => {
      dump('setsToWin', 3)
      const match = new RegularMatch(
        [
          ['Player1', 'Player2'],
          ['Player3', 'Player4'],
        ],
        [3, 3]
      )
      expect(match.winningTeam).to.be.null
    })

    it('returns null when setsWon contains null values', () => {
      dump('setsToWin', 3)
      const match = new RegularMatch(
        [
          ['Player1', 'Player2'],
          ['Player3', 'Player4'],
        ],
        [null, null]
      )
      expect(match.winningTeam).to.be.null

      const match2 = new RegularMatch(
        [
          ['Player1', 'Player2'],
          ['Player3', 'Player4'],
        ],
        [3, null]
      )
      expect(match2.winningTeam).to.be.null
    })
  })

  describe('edge cases', () => {
    it('works with setsToWin = 1', () => {
      dump('setsToWin', 1)
      const match = new RegularMatch(
        [
          ['Player1', 'Player2'],
          ['Player3', 'Player4'],
        ],
        [1, 0]
      )
      expect(match.winningTeam).to.equal(0)
    })

    it('works with setsToWin = 5', () => {
      dump('setsToWin', 5)
      const match = new RegularMatch(
        [
          ['Player1', 'Player2'],
          ['Player3', 'Player4'],
        ],
        [5, 3]
      )
      expect(match.winningTeam).to.equal(0)
    })

    it('handles setsWon values greater than setsToWin', () => {
      dump('setsToWin', 3)
      const match = new RegularMatch(
        [
          ['Player1', 'Player2'],
          ['Player3', 'Player4'],
        ],
        [5, 1]
      )
      expect(match.winningTeam).to.be.null
    })
  })
})
