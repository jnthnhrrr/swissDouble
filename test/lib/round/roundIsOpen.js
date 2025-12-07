import { expect } from 'chai'
import { JSDOM } from 'jsdom'
import { roundIsOpen } from '../../../dist/round.js'
import { RegularMatch } from '../../../dist/types.js'
import { dump } from '../../../dist/storage.js'

describe('roundIsOpen', () => {
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
    dump('setsToWin', 1)
  })

  describe('when round contains free games', () => {
    it('returns true if any setsWon contains null', () => {
      const round = [
        new RegularMatch(
          [
            ['Player1', 'Player2'],
            ['Player3', 'Player4'],
          ],
          [null, null]
        ),
        new RegularMatch(
          [
            ['Player5', 'Player6'],
            ['Player7', 'Player8'],
          ],
          [0, 1]
        ),
        {
          isFreeGame: true,
          player: 'Player9',
        },
      ]

      expect(roundIsOpen(round)).to.be.true
    })

    it('returns false if all setsWon are determined', () => {
      const round = [
        new RegularMatch(
          [
            ['Player1', 'Player2'],
            ['Player3', 'Player4'],
          ],
          [1, 0]
        ),
        new RegularMatch(
          [
            ['Player5', 'Player6'],
            ['Player7', 'Player8'],
          ],
          [0, 1]
        ),
        {
          isFreeGame: true,
          player: 'Player9',
        },
      ]

      expect(roundIsOpen(round)).to.be.false
    })
  })
})
