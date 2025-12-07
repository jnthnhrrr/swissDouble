import { expect } from 'chai'
import { JSDOM } from 'jsdom'
import { RegularMatch } from '../../../dist/types.js'
import { dump } from '../../../dist/storage.js'
import { roundIsOpen } from '../../../dist/round.js'

describe('Tie Detection', () => {
  before(() => {
    const dom = new JSDOM('', { url: 'http://localhost' })
    global.window = dom.window
    global.document = dom.window.document
    global.localStorage = dom.window.localStorage
  })

  after(() => {
    delete global.window
    delete global.document
    delete global.localStorage
  })

  beforeEach(() => {
    localStorage.clear()
    dump('setsToWin', 3)
  })

  describe('winningTeam getter', () => {
    it('returns null when both teams have setsToWin (tie)', () => {
      const match = new RegularMatch(
        [
          ['Player1', 'Player2'],
          ['Player3', 'Player4'],
        ],
        [3, 3]
      )
      expect(match.winningTeam).to.be.null
    })

    it('returns null when both teams have setsToWin=1 (tie)', () => {
      dump('setsToWin', 1)
      const match = new RegularMatch(
        [
          ['Player1', 'Player2'],
          ['Player3', 'Player4'],
        ],
        [1, 1]
      )
      expect(match.winningTeam).to.be.null
    })

    it('returns null when neither team has setsToWin', () => {
      const match = new RegularMatch(
        [
          ['Player1', 'Player2'],
          ['Player3', 'Player4'],
        ],
        [2, 2]
      )
      expect(match.winningTeam).to.be.null
    })

    it('returns null when neither team has setsToWin (different values)', () => {
      const match = new RegularMatch(
        [
          ['Player1', 'Player2'],
          ['Player3', 'Player4'],
        ],
        [1, 2]
      )
      expect(match.winningTeam).to.be.null
    })
  })

  describe('roundIsOpen', () => {
    it('considers round open when both entries are null', () => {
      const round = [
        new RegularMatch(
          [
            ['Player1', 'Player2'],
            ['Player3', 'Player4'],
          ],
          [null, null]
        ),
      ]
      expect(roundIsOpen(round)).to.be.true
    })

    it('considers round open when one entry is null and the other is non-null (team 0 has value)', () => {
      const round = [
        new RegularMatch(
          [
            ['Player1', 'Player2'],
            ['Player3', 'Player4'],
          ],
          [2, null]
        ),
      ]
      expect(roundIsOpen(round)).to.be.true
    })

    it('considers round open when one entry is null and the other is non-null (team 1 has value)', () => {
      const round = [
        new RegularMatch(
          [
            ['Player1', 'Player2'],
            ['Player3', 'Player4'],
          ],
          [null, 2]
        ),
      ]
      expect(roundIsOpen(round)).to.be.true
    })

    it('considers round open when match has tie (both have setsToWin)', () => {
      const round = [
        new RegularMatch(
          [
            ['Player1', 'Player2'],
            ['Player3', 'Player4'],
          ],
          [3, 3]
        ),
      ]
      expect(roundIsOpen(round)).to.be.true
    })

    it('considers round open when neither team has setsToWin', () => {
      const round = [
        new RegularMatch(
          [
            ['Player1', 'Player2'],
            ['Player3', 'Player4'],
          ],
          [2, 2]
        ),
      ]
      expect(roundIsOpen(round)).to.be.true
    })

    it('considers round open when neither team has setsToWin (different values)', () => {
      const round = [
        new RegularMatch(
          [
            ['Player1', 'Player2'],
            ['Player3', 'Player4'],
          ],
          [1, 2]
        ),
      ]
      expect(roundIsOpen(round)).to.be.true
    })

    it('considers round closed when match has valid winner', () => {
      const round = [
        new RegularMatch(
          [
            ['Player1', 'Player2'],
            ['Player3', 'Player4'],
          ],
          [3, 1]
        ),
      ]
      expect(roundIsOpen(round)).to.be.false
    })
  })
})
