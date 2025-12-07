import { expect } from 'chai'
import { JSDOM } from 'jsdom'
import { calculateSetPoints } from '../../../dist/ranking.js'
import { RegularMatch } from '../../../dist/types.js'
import { dump } from '../../../dist/storage.js'

describe('calculateSetPoints', () => {
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

  describe('when history is empty', () => {
    it('returns zero set points for all participants', () => {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4']
      const history = []

      const result = calculateSetPoints(participants, history)

      expect(result).to.deep.equal({
        Player1: 0,
        Player2: 0,
        Player3: 0,
        Player4: 0,
      })
    })
  })

  describe('when history contains open rounds', () => {
    it('ignores open rounds in set points calculation', () => {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4']
      const history = [
        [
          new RegularMatch(
            [
              ['Player1', 'Player2'],
              ['Player3', 'Player4'],
            ],
            [null, null]
          ),
        ],
      ]

      const result = calculateSetPoints(participants, history)

      expect(result).to.deep.equal({
        Player1: 0,
        Player2: 0,
        Player3: 0,
        Player4: 0,
      })
    })
  })

  describe('when history contains regular matches', () => {
    it('calculates set points correctly for simple match', () => {
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

      const result = calculateSetPoints(participants, history)

      // Team 0 (Player1, Player2) won 1-0: +1 set points each
      // Team 1 (Player3, Player4) lost 0-1: -1 set points each
      expect(result['Player1']).to.equal(1)
      expect(result['Player2']).to.equal(1)
      expect(result['Player3']).to.equal(-1)
      expect(result['Player4']).to.equal(-1)
    })

    it('calculates set points correctly for match with higher scores', () => {
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

      const result = calculateSetPoints(participants, history)

      // Team 0 won 3-1: +2 set points each (3-1 = 2)
      // Team 1 lost 1-3: -2 set points each (1-3 = -2)
      expect(result['Player1']).to.equal(2)
      expect(result['Player2']).to.equal(2)
      expect(result['Player3']).to.equal(-2)
      expect(result['Player4']).to.equal(-2)
    })

    it('accumulates set points across multiple rounds', () => {
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
            [0, 1]
          ),
        ],
      ]

      const result = calculateSetPoints(participants, history)

      // Round 1: Player1, Player2: +1 each; Player3, Player4: -1 each
      // Round 2: Player1, Player3: -1 each; Player2, Player4: +1 each
      // Totals:
      expect(result['Player1']).to.equal(0) // +1 -1 = 0
      expect(result['Player2']).to.equal(2) // +1 +1 = 2
      expect(result['Player3']).to.equal(-2) // -1 -1 = -2
      expect(result['Player4']).to.equal(0) // -1 +1 = 0
    })
  })

  describe('when history contains free games', () => {
    it('awards 0 set points to free game player', () => {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4', 'Player5']
      const history = [
        [
          new RegularMatch(
            [
              ['Player1', 'Player2'],
              ['Player3', 'Player4'],
            ],
            [1, 0]
          ),
          {
            isFreeGame: true,
            player: 'Player5',
          },
        ],
      ]

      const result = calculateSetPoints(participants, history)

      expect(result['Player1']).to.equal(1)
      expect(result['Player2']).to.equal(1)
      expect(result['Player3']).to.equal(-1)
      expect(result['Player4']).to.equal(-1)
      expect(result['Player5']).to.equal(0)
    })

    it('handles multiple free games', () => {
      const participants = ['Player1', 'Player2', 'Player3']
      const history = [
        [
          {
            isFreeGame: true,
            player: 'Player1',
          },
          {
            isFreeGame: true,
            player: 'Player2',
          },
          {
            isFreeGame: true,
            player: 'Player3',
          },
        ],
      ]

      const result = calculateSetPoints(participants, history)

      expect(result['Player1']).to.equal(0)
      expect(result['Player2']).to.equal(0)
      expect(result['Player3']).to.equal(0)
    })
  })

  describe('edge cases', () => {
    it('handles matches with null setsWon gracefully', () => {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4']
      const history = [
        [
          new RegularMatch(
            [
              ['Player1', 'Player2'],
              ['Player3', 'Player4'],
            ],
            [null, 0]
          ),
        ],
      ]

      const result = calculateSetPoints(participants, history)

      // Should skip matches with null values
      expect(result['Player1']).to.equal(0)
      expect(result['Player2']).to.equal(0)
      expect(result['Player3']).to.equal(0)
      expect(result['Player4']).to.equal(0)
    })

    it('handles negative set points', () => {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4']
      const history = [
        [
          new RegularMatch(
            [
              ['Player1', 'Player2'],
              ['Player3', 'Player4'],
            ],
            [0, 1]
          ),
        ],
      ]

      const result = calculateSetPoints(participants, history)

      // Team 0 lost 0-1: -1 set points each
      // Team 1 won 1-0: +1 set points each
      expect(result['Player1']).to.equal(-1)
      expect(result['Player2']).to.equal(-1)
      expect(result['Player3']).to.equal(1)
      expect(result['Player4']).to.equal(1)
    })

    it('handles zero set points', () => {
      dump('setsToWin', 1)
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
            [0, 1]
          ),
        ],
      ]

      const result = calculateSetPoints(participants, history)

      // Round 1: Player1, Player2: +1; Player3, Player4: -1
      // Round 2: Player1, Player3: -1; Player2, Player4: +1
      // Player1: +1 -1 = 0
      expect(result['Player1']).to.equal(0)
    })
  })

  describe('complex scenarios', () => {
    it('handles mixed regular matches and free games across multiple rounds', () => {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4', 'Player5']
      const history = [
        [
          new RegularMatch(
            [
              ['Player1', 'Player2'],
              ['Player3', 'Player4'],
            ],
            [1, 0]
          ),
          {
            isFreeGame: true,
            player: 'Player5',
          },
        ],
        [
          new RegularMatch(
            [
              ['Player1', 'Player3'],
              ['Player2', 'Player5'],
            ],
            [0, 1]
          ),
          {
            isFreeGame: true,
            player: 'Player4',
          },
        ],
      ]

      const result = calculateSetPoints(participants, history)

      // Round 1: Player1, Player2: +1; Player3, Player4: -1; Player5: 0
      // Round 2: Player1, Player3: -1; Player2, Player5: +1; Player4: 0
      expect(result['Player1']).to.equal(0) // +1 -1 = 0
      expect(result['Player2']).to.equal(2) // +1 +1 = 2
      expect(result['Player3']).to.equal(-2) // -1 -1 = -2
      expect(result['Player4']).to.equal(-1) // -1 +0 = -1
      expect(result['Player5']).to.equal(1) // 0 +1 = 1
    })
  })
})
