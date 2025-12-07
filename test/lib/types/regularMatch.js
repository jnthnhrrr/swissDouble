import { expect } from 'chai'
import { JSDOM } from 'jsdom'
import { RegularMatch } from '../../../dist/types.js'
import { dump, load } from '../../../dist/storage.js'

describe('RegularMatch', () => {
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
    dump('setsToWin', 1) // Default
  })

  describe('constructor', () => {
    it('creates a RegularMatch with default setsWon [null, null]', () => {
      const match = new RegularMatch([
        ['Player1', 'Player2'],
        ['Player3', 'Player4'],
      ])

      expect(match.teams).to.deep.equal([
        ['Player1', 'Player2'],
        ['Player3', 'Player4'],
      ])
      expect(match.setsWon).to.deep.equal([null, null])
    })

    it('creates a RegularMatch with specified setsWon', () => {
      const match = new RegularMatch(
        [
          ['Player1', 'Player2'],
          ['Player3', 'Player4'],
        ],
        [3, 1]
      )

      expect(match.setsWon).to.deep.equal([3, 1])
    })
  })

  describe('winningTeam getter', () => {
    it('returns null when setsWon is [null, null]', () => {
      const match = new RegularMatch([
        ['Player1', 'Player2'],
        ['Player3', 'Player4'],
      ])
      expect(match.winningTeam).to.be.null
    })

    it('returns 0 when team 0 has setsToWin sets', () => {
      dump('setsToWin', 3)
      const match = new RegularMatch(
        [
          ['Player1', 'Player2'],
          ['Player3', 'Player4'],
        ],
        [3, 1]
      )
      expect(match.winningTeam).to.equal(0)
    })

    it('returns 1 when team 1 has setsToWin sets', () => {
      dump('setsToWin', 3)
      const match = new RegularMatch(
        [
          ['Player1', 'Player2'],
          ['Player3', 'Player4'],
        ],
        [1, 3]
      )
      expect(match.winningTeam).to.equal(1)
    })

    it('returns null when neither team has setsToWin sets', () => {
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

    it('returns null when both teams have setsToWin sets (invalid state)', () => {
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

    it('works with setsToWin = 1 (default)', () => {
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
  })

  describe('fromPlainObject', () => {
    it('creates RegularMatch from object with setsWon', () => {
      const obj = {
        teams: [
          ['Player1', 'Player2'],
          ['Player3', 'Player4'],
        ],
        setsWon: [3, 1],
      }
      const match = RegularMatch.fromPlainObject(obj)

      expect(match).to.be.instanceOf(RegularMatch)
      expect(match.setsWon).to.deep.equal([3, 1])
    })

    it('creates RegularMatch with [null, null] when setsWon is missing', () => {
      const obj = {
        teams: [
          ['Player1', 'Player2'],
          ['Player3', 'Player4'],
        ],
      }
      const match = RegularMatch.fromPlainObject(obj)

      expect(match.setsWon).to.deep.equal([null, null])
    })

    it('migrates from winningTeam = 0 to setsWon = [1, 0]', () => {
      const obj = {
        teams: [
          ['Player1', 'Player2'],
          ['Player3', 'Player4'],
        ],
        winningTeam: 0,
      }
      const match = RegularMatch.fromPlainObject(obj)

      expect(match.setsWon).to.deep.equal([1, 0])
    })

    it('migrates from winningTeam = 1 to setsWon = [0, 1]', () => {
      const obj = {
        teams: [
          ['Player1', 'Player2'],
          ['Player3', 'Player4'],
        ],
        winningTeam: 1,
      }
      const match = RegularMatch.fromPlainObject(obj)

      expect(match.setsWon).to.deep.equal([0, 1])
    })

    it('migrates from winningTeam = null to setsWon = [null, null]', () => {
      const obj = {
        teams: [
          ['Player1', 'Player2'],
          ['Player3', 'Player4'],
        ],
        winningTeam: null,
      }
      const match = RegularMatch.fromPlainObject(obj)

      expect(match.setsWon).to.deep.equal([null, null])
    })

    it('prefers setsWon over winningTeam when both are present', () => {
      const obj = {
        teams: [
          ['Player1', 'Player2'],
          ['Player3', 'Player4'],
        ],
        setsWon: [3, 1],
        winningTeam: 1, // Should be ignored
      }
      const match = RegularMatch.fromPlainObject(obj)

      expect(match.setsWon).to.deep.equal([3, 1])
    })
  })

  describe('toJSON', () => {
    it('serializes to JSON with teams and setsWon', () => {
      const match = new RegularMatch(
        [
          ['Player1', 'Player2'],
          ['Player3', 'Player4'],
        ],
        [3, 1]
      )

      const json = match.toJSON()

      expect(json).to.deep.equal({
        teams: [
          ['Player1', 'Player2'],
          ['Player3', 'Player4'],
        ],
        setsWon: [3, 1],
      })
    })

    it('serializes null values correctly', () => {
      const match = new RegularMatch([
        ['Player1', 'Player2'],
        ['Player3', 'Player4'],
      ])

      const json = match.toJSON()

      expect(json.setsWon).to.deep.equal([null, null])
    })
  })
})
