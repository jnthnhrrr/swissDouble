import { expect } from 'chai'
import { JSDOM } from 'jsdom'
import { incrementRoundCount } from '../../../dist/tournament.js'
import { tournamentHasStarted, tournamentHasFinished } from '../../../dist/tournament.js'
import { dump, load } from '../../../dist/storage.js'

describe('incrementRoundCount', function () {
  before(() => {
    const dom = new JSDOM('', { url: 'http://localhost' })
    global.window = dom.window
    global.localStorage = dom.window.localStorage
  })

  afterEach(() => {
    localStorage.clear()
  })

  after(() => {
    delete global.window
    delete global.localStorage
  })

  describe('when tournament has not started', function () {
    it('does not extend round count', function () {
      dump('roundCount', 5)
      dump('history', [])

      const result = incrementRoundCount()

      expect(result).to.be.false
      expect(load('roundCount')).to.equal(5)
    })
  })

  describe('when tournament has started', function () {
    it('increments roundCount by 1', function () {
      dump('roundCount', 3)
      dump('history', [
        [
          {
            teams: [
              ['Player1', 'Player2'],
              ['Player3', 'Player4'],
            ],
            winningTeam: 0,
          },
        ],
      ])

      incrementRoundCount()

      expect(load('roundCount')).to.equal(4)
    })

    it('persists roundCount correctly', function () {
      dump('roundCount', 5)
      dump('history', [
        [
          {
            teams: [
              ['Player1', 'Player2'],
              ['Player3', 'Player4'],
            ],
            winningTeam: 0,
          },
        ],
      ])

      incrementRoundCount()

      const storedRoundCount = load('roundCount')
      expect(storedRoundCount).to.equal(6)
    })

    it('does not affect existing history', function () {
      const originalHistory = [
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
            winningTeam: 1,
          },
        ],
      ]
      dump('roundCount', 3)
      dump('history', originalHistory)

      incrementRoundCount()

      const history = load('history')
      expect(history).to.deep.equal(originalHistory)
      expect(history.length).to.equal(2)
    })

    it('works when called multiple times', function () {
      dump('roundCount', 3)
      dump('history', [
        [
          {
            teams: [
              ['Player1', 'Player2'],
              ['Player3', 'Player4'],
            ],
            winningTeam: 0,
          },
        ],
      ])

      incrementRoundCount()
      incrementRoundCount()
      incrementRoundCount()

      expect(load('roundCount')).to.equal(6)
    })
  })

  describe('when tournament has finished', function () {
    it('still allows extending round count', function () {
      dump('roundCount', 3)
      dump('history', [
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
            winningTeam: 1,
          },
        ],
        [
          {
            teams: [
              ['Player1', 'Player4'],
              ['Player2', 'Player3'],
            ],
            winningTeam: 0,
          },
        ],
      ])

      const history = load('history')
      const roundCount = load('roundCount')
      expect(tournamentHasFinished(history, roundCount)).to.be.true

      incrementRoundCount()

      expect(load('roundCount')).to.equal(4)
    })

    it('does not affect existing history when tournament is finished', function () {
      const originalHistory = [
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
            winningTeam: 1,
          },
        ],
      ]
      dump('roundCount', 2)
      dump('history', originalHistory)

      incrementRoundCount()

      const history = load('history')
      expect(history).to.deep.equal(originalHistory)
    })
  })
})
