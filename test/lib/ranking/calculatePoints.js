import { expect } from 'chai'
import { calculatePoints } from '../../../dist/ranking.js'

describe('calculatePoints', () => {
  describe('when history is empty', () => {
    it('returns zero points for all participants', () => {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4']
      const history = []

      const result = calculatePoints(participants, history)

      expect(result).to.deep.equal({
        Player1: 0,
        Player2: 0,
        Player3: 0,
        Player4: 0,
      })
    })
  })

  describe('when history contains open rounds', () => {
    it('ignores open rounds in point calculation', () => {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4']
      const history = [
        [
          {
            teams: [
              ['Player1', 'Player2'],
              ['Player3', 'Player4'],
            ],
            winningTeam: null,
          },
        ],
      ]

      const result = calculatePoints(participants, history)

      expect(result).to.deep.equal({
        Player1: 0,
        Player2: 0,
        Player3: 0,
        Player4: 0,
      })
    })
  })

  describe('when history contains regular matches', () => {
    it('awards points to winning team members', () => {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4']
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

      const result = calculatePoints(participants, history)

      expect(result['Player1']).to.equal(1)
      expect(result['Player2']).to.equal(1)
      expect(result['Player3']).to.equal(0)
      expect(result['Player4']).to.equal(0)
    })

    it('handles team 1 winning', () => {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4']
      const history = [
        [
          {
            teams: [
              ['Player1', 'Player2'],
              ['Player3', 'Player4'],
            ],
            winningTeam: 1,
          },
        ],
      ]

      const result = calculatePoints(participants, history)

      expect(result['Player1']).to.equal(0)
      expect(result['Player2']).to.equal(0)
      expect(result['Player3']).to.equal(1)
      expect(result['Player4']).to.equal(1)
    })

    it('accumulates points across multiple rounds', () => {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4']
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
            winningTeam: 1,
          },
        ],
      ]

      const result = calculatePoints(participants, history)

      expect(result['Player1']).to.equal(1) // Won first round
      expect(result['Player2']).to.equal(2) // Won both rounds
      expect(result['Player3']).to.equal(0)
      expect(result['Player4']).to.equal(1) // Won second round
    })
  })

  describe('when history contains free games', () => {
    it('awards 1 point to free game player', () => {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4', 'Player5']
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

      const result = calculatePoints(participants, history)

      expect(result['Player1']).to.equal(1)
      expect(result['Player2']).to.equal(1)
      expect(result['Player3']).to.equal(0)
      expect(result['Player4']).to.equal(0)
      expect(result['Player5']).to.equal(1)
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

      const result = calculatePoints(participants, history)

      expect(result['Player1']).to.equal(1)
      expect(result['Player2']).to.equal(1)
      expect(result['Player3']).to.equal(1)
    })
  })

  describe('complex scenarios', () => {
    it('handles mixed regular matches and free games across multiple rounds', () => {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4', 'Player5']
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
        [
          {
            teams: [
              ['Player1', 'Player3'],
              ['Player2', 'Player5'],
            ],
            winningTeam: 1,
          },
          {
            isFreeGame: true,
            player: 'Player4',
          },
        ],
      ]

      const result = calculatePoints(participants, history)

      expect(result['Player1']).to.equal(1) // Won round 1
      expect(result['Player2']).to.equal(2) // Won round 1 and round 2
      expect(result['Player3']).to.equal(0)
      expect(result['Player4']).to.equal(1) // Free game in round 2
      expect(result['Player5']).to.equal(2) // Free game round 1, won round 2
    })
  })
})
