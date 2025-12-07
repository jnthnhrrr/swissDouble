import { expect } from 'chai'
import { JSDOM } from 'jsdom'
import {
  calculateRanking,
  getDefaultRankingOrder,
  getRankingOrder,
  createRankingSort,
} from '../../../dist/ranking.js'
import { RegularMatch } from '../../../dist/types.js'
import { dump, load } from '../../../dist/storage.js'

describe('Ranking Order', () => {
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

  describe('getDefaultRankingOrder', () => {
    it('returns default order without setPoints when setsToWin is 1', () => {
      const order = getDefaultRankingOrder(1)
      expect(order).to.deep.equal(['points', 'buchholz'])
    })

    it('returns default order with setPoints when setsToWin is greater than 1', () => {
      const order = getDefaultRankingOrder(2)
      expect(order).to.deep.equal(['points', 'setPoints', 'buchholz'])
    })

    it('returns default order without setPoints when setsToWin is not set', () => {
      const order = getDefaultRankingOrder(undefined)
      expect(order).to.deep.equal(['points', 'buchholz'])
    })

    it('returns default order without setPoints when setsToWin is null', () => {
      const order = getDefaultRankingOrder(null)
      expect(order).to.deep.equal(['points', 'buchholz'])
    })
  })

  describe('getRankingOrder', () => {
    it('returns stored ranking order if available', () => {
      dump('setsToWin', 2)
      const customOrder = ['buchholz', 'points', 'setPoints']
      dump('rankingOrder', customOrder)
      const order = getRankingOrder()
      expect(order).to.deep.equal(customOrder)
    })

    it('returns default order when no stored order exists and setsToWin > 1', () => {
      dump('setsToWin', 2)
      const order = getRankingOrder()
      expect(order).to.deep.equal(['points', 'setPoints', 'buchholz'])
    })

    it('returns default order without setPoints when setsToWin is 1', () => {
      dump('setsToWin', 1)
      const order = getRankingOrder()
      expect(order).to.deep.equal(['points', 'buchholz'])
    })

    it('returns default order when setsToWin is not set', () => {
      localStorage.clear()
      const order = getRankingOrder()
      expect(order).to.deep.equal(['points', 'buchholz'])
    })
  })

  describe('createRankingSort', () => {
    it('sorts by points first when order is ["points", "buchholz", "setPoints"]', () => {
      const order = ['points', 'buchholz', 'setPoints']
      const sortFn = createRankingSort(order)

      const row1 = ['Player1', 2, 5, 3]
      const row2 = ['Player2', 1, 10, 5]

      expect(sortFn(row1, row2)).to.be.below(0)
      expect(sortFn(row2, row1)).to.be.above(0)
    })

    it('sorts by buchholz when points are equal', () => {
      const order = ['points', 'buchholz', 'setPoints']
      const sortFn = createRankingSort(order)

      const row1 = ['Player1', 2, 10, 3]
      const row2 = ['Player2', 2, 5, 5]

      expect(sortFn(row1, row2)).to.be.below(0)
      expect(sortFn(row2, row1)).to.be.above(0)
    })

    it('sorts by setPoints when points and buchholz are equal', () => {
      const order = ['points', 'buchholz', 'setPoints']
      const sortFn = createRankingSort(order)

      const row1 = ['Player1', 2, 5, 10]
      const row2 = ['Player2', 2, 5, 5]

      expect(sortFn(row1, row2)).to.be.below(0)
      expect(sortFn(row2, row1)).to.be.above(0)
    })

    it('sorts by custom order when order is ["buchholz", "points", "setPoints"]', () => {
      const order = ['buchholz', 'points', 'setPoints']
      const sortFn = createRankingSort(order)

      const row1 = ['Player1', 1, 10, 3]
      const row2 = ['Player2', 2, 5, 5]

      expect(sortFn(row1, row2)).to.be.below(0)
      expect(sortFn(row2, row1)).to.be.above(0)
    })

    it('sorts by setPoints first when order is ["setPoints", "points", "buchholz"]', () => {
      const order = ['setPoints', 'points', 'buchholz']
      const sortFn = createRankingSort(order)

      const row1 = ['Player1', 1, 5, 10]
      const row2 = ['Player2', 2, 10, 5]

      expect(sortFn(row1, row2)).to.be.below(0)
      expect(sortFn(row2, row1)).to.be.above(0)
    })

    it('returns 0 when all values are equal', () => {
      const order = ['points', 'buchholz', 'setPoints']
      const sortFn = createRankingSort(order)

      const row1 = ['Player1', 2, 5, 3]
      const row2 = ['Player2', 2, 5, 3]

      expect(sortFn(row1, row2)).to.equal(0)
    })
  })

  describe('calculateRanking with custom order', () => {
    it('sorts ranking according to custom order', () => {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4']
      const history = [
        [
          new RegularMatch(
            [
              ['Player1', 'Player2'],
              ['Player3', 'Player4'],
            ],
            [1, 0]
          ),
        ],
        [
          new RegularMatch(
            [
              ['Player1', 'Player3'],
              ['Player2', 'Player4'],
            ],
            [1, 0]
          ),
        ],
      ]

      const customOrder = ['buchholz', 'points', 'setPoints']
      const ranking = calculateRanking(participants, history, customOrder)

      expect(ranking).to.have.length(4)
      expect(ranking[0][2]).to.be.at.least(ranking[1][2])
    })

    it('uses default order when no order is provided', () => {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4']
      const history = [
        [
          new RegularMatch(
            [
              ['Player1', 'Player2'],
              ['Player3', 'Player4'],
            ],
            [1, 0]
          ),
        ],
      ]

      const ranking = calculateRanking(participants, history)

      expect(ranking).to.have.length(4)
      expect(ranking[0][1]).to.be.at.least(ranking[1][1])
    })

    it('sorts correctly with order ["setPoints", "buchholz", "points"]', () => {
      dump('setsToWin', 3)
      const participants = ['Player1', 'Player2', 'Player3', 'Player4']
      const history = [
        [
          new RegularMatch(
            [
              ['Player1', 'Player2'],
              ['Player3', 'Player4'],
            ],
            [3, 1]
          ),
        ],
      ]

      const customOrder = ['setPoints', 'buchholz', 'points']
      const ranking = calculateRanking(participants, history, customOrder)

      expect(ranking).to.have.length(4)
      const player1Index = ranking.findIndex((r) => r[0] === 'Player1')
      const player3Index = ranking.findIndex((r) => r[0] === 'Player3')

      expect(player1Index).to.be.below(player3Index)
    })
  })

  describe('backward compatibility', () => {
    it('uses default order when rankingOrder is not stored and setsToWin is 1', () => {
      localStorage.clear()
      dump('setsToWin', 1)
      const order = getRankingOrder()
      expect(order).to.deep.equal(['points', 'buchholz'])
    })

    it('uses default order when rankingOrder is not stored and setsToWin > 1', () => {
      localStorage.clear()
      dump('setsToWin', 2)
      const order = getRankingOrder()
      expect(order).to.deep.equal(['points', 'setPoints', 'buchholz'])
    })

    it('handles missing setPoints in stored order gracefully when setsToWin > 1', () => {
      dump('rankingOrder', ['points', 'buchholz'])
      dump('setsToWin', 2)
      const order = getRankingOrder()
      expect(order).to.include('setPoints')
    })
  })
})
