import { expect } from 'chai'
import { JSDOM } from 'jsdom'
import { RegularMatch } from '../../../dist/types.js'
import { migrateHistory, ensureSetsToWin, dump, load } from '../../../dist/storage.js'

describe('Storage Migration', () => {
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

  describe('migrateHistory', () => {
    it('converts plain RegularMatch objects to class instances', () => {
      const history = [
        [
          {
            teams: [
              ['Player1', 'Player2'],
              ['Player3', 'Player4'],
            ],
            setsWon: [3, 1],
          },
        ],
      ]

      const migrated = migrateHistory(history)

      expect(migrated[0][0]).to.be.instanceOf(RegularMatch)
      expect(migrated[0][0].setsWon).to.deep.equal([3, 1])
    })

    it('migrates from winningTeam to setsWon', () => {
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

      const migrated = migrateHistory(history)

      expect(migrated[0][0]).to.be.instanceOf(RegularMatch)
      expect(migrated[0][0].setsWon).to.deep.equal([1, 0])
    })

    it('leaves free games unchanged', () => {
      const history = [
        [
          {
            teams: [
              ['Player1', 'Player2'],
              ['Player3', 'Player4'],
            ],
            setsWon: [3, 1],
          },
          {
            isFreeGame: true,
            player: 'Player5',
          },
        ],
      ]

      const migrated = migrateHistory(history)

      expect(migrated[0][0]).to.be.instanceOf(RegularMatch)
      expect(migrated[0][1]).to.have.property('isFreeGame', true)
      expect(migrated[0][1]).to.have.property('player', 'Player5')
    })

    it('leaves already migrated RegularMatch instances unchanged', () => {
      const match = new RegularMatch(
        [
          ['Player1', 'Player2'],
          ['Player3', 'Player4'],
        ],
        [3, 1]
      )
      const history = [[match]]

      const migrated = migrateHistory(history)

      expect(migrated[0][0]).to.equal(match) // Same instance
      expect(migrated[0][0].setsWon).to.deep.equal([3, 1])
    })

    it('handles empty history', () => {
      const history = []
      const migrated = migrateHistory(history)
      expect(migrated).to.deep.equal([])
    })

    it('handles history with multiple rounds', () => {
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
        [
          {
            teams: [
              ['Player1', 'Player3'],
              ['Player2', 'Player4'],
            ],
            setsWon: [3, 2],
          },
        ],
      ]

      const migrated = migrateHistory(history)

      expect(migrated[0][0]).to.be.instanceOf(RegularMatch)
      expect(migrated[0][0].setsWon).to.deep.equal([1, 0])
      expect(migrated[1][0]).to.be.instanceOf(RegularMatch)
      expect(migrated[1][0].setsWon).to.deep.equal([3, 2])
    })
  })

  describe('ensureSetsToWin', () => {
    it('sets setsToWin to 1 if not present', () => {
      ensureSetsToWin()
      expect(load('setsToWin')).to.equal(1)
    })

    it('returns existing setsToWin if present', () => {
      dump('setsToWin', 3)
      const result = ensureSetsToWin()
      expect(result).to.equal(3)
      expect(load('setsToWin')).to.equal(3)
    })

    it('handles null values', () => {
      dump('setsToWin', null)
      ensureSetsToWin()
      expect(load('setsToWin')).to.equal(1)
    })
  })
})
