import { expect } from 'chai'
import { JSDOM } from 'jsdom'
import { calculateFreeGamers } from '../../../dist/freeGamers.js'
import { dump } from '../../../dist/storage.js'

describe('Free Game Strategy', function () {
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
    dump('setsToWin', 1)
  })

  const participants = ['Player1', 'Player2', 'Player3', 'Player4', 'Player5']

  describe('calculateFreeGamers with bottom-ranking strategy', function () {
    it('matches bottom-ranking strategy when no strategy specified', function () {
      const history = [
        [
          {
            teams: [
              ['Player1', 'Player2'],
              ['Player3', 'Player4'],
            ],
            winningTeam: 0,
          },
          {
            isFreeGame: true,
            player: 'Player5',
          },
        ],
      ]

      const resultDefault = calculateFreeGamers(participants, history)
      const resultBottomRanking = calculateFreeGamers(participants, history, 'bottom-ranking')

      expect(resultDefault).to.deep.equal(resultBottomRanking)
    })

    it('selects lowest ranked players without free games', function () {
      const history = [
        [
          {
            teams: [
              ['Player1', 'Player2'],
              ['Player3', 'Player4'],
            ],
            winningTeam: 0,
          },
          {
            isFreeGame: true,
            player: 'Player5',
          },
        ],
      ]

      const result = calculateFreeGamers(participants, history, 'bottom-ranking')

      expect(result).to.have.length(1)
      expect(result[0]).to.equal('Player4')
    })

    it('respects fair distribution rule', function () {
      const history = []
      for (let round = 0; round < 5; round++) {
        history.push([
          {
            teams: [
              ['Player1', 'Player2'],
              ['Player3', 'Player4'],
            ],
            winningTeam: 0,
          },
          {
            isFreeGame: true,
            player: `Player${(round % 5) + 1}`,
          },
        ])
      }

      const result = calculateFreeGamers(participants, history, 'bottom-ranking')

      expect(result).to.have.length(1)
      expect(participants).to.include(result[0])
    })
  })

  describe('calculateFreeGamers with random strategy', function () {
    it('selects from eligible players', function () {
      const history = [
        [
          {
            teams: [
              ['Player1', 'Player2'],
              ['Player3', 'Player4'],
            ],
            winningTeam: 0,
          },
          {
            isFreeGame: true,
            player: 'Player5',
          },
        ],
      ]

      const result = calculateFreeGamers(participants, history, 'random')

      expect(result).to.have.length(1)
      expect(['Player1', 'Player2', 'Player3', 'Player4']).to.include(result[0])
    })

    it('can select any eligible player', function () {
      const history = [
        [
          {
            teams: [
              ['Player1', 'Player2'],
              ['Player3', 'Player4'],
            ],
            winningTeam: 0,
          },
          {
            isFreeGame: true,
            player: 'Player5',
          },
        ],
      ]

      const eligiblePlayers = ['Player1', 'Player2', 'Player3', 'Player4']
      const results = new Set()

      for (let i = 0; i < 100; i++) {
        const result = calculateFreeGamers(participants, history, 'random')
        results.add(result[0])
      }

      expect(results.size).to.be.at.least(2)
      results.forEach((player) => {
        expect(eligiblePlayers).to.include(player)
      })
    })

    it('respects fair distribution rule', function () {
      const history = []
      for (let round = 0; round < 5; round++) {
        history.push([
          {
            teams: [
              ['Player1', 'Player2'],
              ['Player3', 'Player4'],
            ],
            winningTeam: 0,
          },
          {
            isFreeGame: true,
            player: `Player${(round % 5) + 1}`,
          },
        ])
      }

      const result = calculateFreeGamers(participants, history, 'random')

      expect(result).to.have.length(1)
      expect(participants).to.include(result[0])
    })

    it('selects correct number of players', function () {
      const participants6 = ['Player1', 'Player2', 'Player3', 'Player4', 'Player5', 'Player6']
      const history = []

      const result = calculateFreeGamers(participants6, history, 'random')

      expect(result).to.have.length(2)
      result.forEach((player) => {
        expect(participants6).to.include(player)
      })
    })
  })

  describe('default strategy', function () {
    it('defaults to bottom-ranking when not specified', function () {
      const history = [
        [
          {
            teams: [
              ['Player1', 'Player2'],
              ['Player3', 'Player4'],
            ],
            winningTeam: 0,
          },
          {
            isFreeGame: true,
            player: 'Player5',
          },
        ],
      ]

      const resultDefault = calculateFreeGamers(participants, history)
      const resultBottomRanking = calculateFreeGamers(participants, history, 'bottom-ranking')

      expect(resultDefault).to.deep.equal(resultBottomRanking)
    })
  })
})
