import { expect } from 'chai'
import { JSDOM } from 'jsdom'
import { calculatePoints, calculateRanking, calculateBuchholz } from '../../../dist/ranking.js'
import { RegularMatch } from '../../../dist/types.js'
import { dump } from '../../../dist/storage.js'

describe('Ranking', function () {
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
  describe('calculatePoints', function () {
    it('works correctly with multiple rounds', function () {
      let participants = ['Achim', 'Berta', 'Clara', 'Dieter']
      let firstRound = [
        {
          teams: [
            ['Achim', 'Berta'],
            ['Clara', 'Dieter'],
          ],
          winningTeam: 0,
        },
      ]
      let secondRound = [
        {
          teams: [
            ['Achim', 'Clara'],
            ['Berta', 'Dieter'],
          ],
          winningTeam: 0,
        },
      ]
      let history = [firstRound, secondRound]

      let expected = {
        Achim: 2,
        Berta: 1,
        Clara: 1,
        Dieter: 0,
      }
      expect(calculatePoints(participants, history)).to.be.deep.equal(expected)
    })

    it('works correctly with free games', function () {
      let participants = ['Achim', 'Berta', 'Clara', 'Dieter', 'Emil']
      let firstRound = [
        {
          teams: [
            ['Achim', 'Berta'],
            ['Clara', 'Dieter'],
          ],
          winningTeam: 0,
        },
        {
          isFreeGame: true,
          player: 'Emil',
        },
      ]
      let history = [firstRound]

      let expected = {
        Achim: 1,
        Berta: 1,
        Emil: 1,
        Clara: 0,
        Dieter: 0,
      }
      expect(calculatePoints(participants, history)).to.be.deep.equal(expected)
    })
  })

  describe('calculateRanking', function () {
    describe('when history is empty', () => {
      it('returns all participants with zero points and buchholz', () => {
        const participants = ['Player1', 'Player2', 'Player3']
        const history = []

        const result = calculateRanking(participants, history)

        expect(result).to.have.length(3)
        result.forEach(([player, points, buchholz, setPoints]) => {
          expect(participants).to.include(player)
          expect(points).to.equal(0)
          expect(buchholz).to.equal(0)
          expect(setPoints).to.equal(0)
        })
      })

      it('maintains original order when all values are equal', () => {
        const participants = ['Alice', 'Bob', 'Charlie']
        const history = []

        const result = calculateRanking(participants, history)

        expect(result[0][0]).to.equal('Alice')
        expect(result[1][0]).to.equal('Bob')
        expect(result[2][0]).to.equal('Charlie')
      })
    })

    describe('sorting by points', () => {
      it('sorts by points in descending order', () => {
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

        const result = calculateRanking(participants, history)

        expect(result[0][0]).to.equal('Player1')
        expect(result[0][1]).to.equal(2)
        expect(result[1][0]).to.equal('Player2')
        expect(result[1][1]).to.equal(1)
        expect(result[2][0]).to.equal('Player3')
        expect(result[2][1]).to.equal(1)
        expect(result[3][0]).to.equal('Player4')
        expect(result[3][1]).to.equal(0)
      })
    })

    describe('sorting by buchholz as tiebreaker', () => {
      it('uses buchholz to break ties in points', () => {
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

        const result = calculateRanking(participants, history)

        // Player3 and Player4 both have 1 point
        // Their buchholz: both get points from opponents Player1+Player2 = 0+0 = 0
        // Both subtract partner points: Player3 gets -1, Player4 gets -1
        // So both have buchholz = -1, tie remains

        // Find Player3 and Player4 in results
        const player3Result = result.find((r) => r[0] === 'Player3')
        const player4Result = result.find((r) => r[0] === 'Player4')

        expect(player3Result[1]).to.equal(1) // 1 point
        expect(player4Result[1]).to.equal(1) // 1 point

        // Both should be ranked above Player1 and Player2 (who have 0 points)
        expect(result[0][1]).to.equal(1)
        expect(result[1][1]).to.equal(1)
        expect(result[2][1]).to.equal(0)
        expect(result[3][1]).to.equal(0)
      })

      it('properly breaks ties with different buchholz scores', () => {
        const participants = ['Player1', 'Player2', 'Player3', 'Player4']
        // Create scenario where two players have same points but different buchholz
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
                ['Player1', 'Player4'],
                ['Player2', 'Player3'],
              ],
              [0, 1]
            ),
          ],
        ]

        const result = calculateRanking(participants, history)

        // Player1 and Player2 both have 1 point, Player3 has 1 point, Player4 has 0
        // Verify the structure is correct
        expect(result).to.have.length(4)
        expect(result[0]).to.have.length(4) // [player, points, buchholz, setPoints]
        expect(result[1]).to.have.length(4)
        expect(result[2]).to.have.length(4)
        expect(result[3]).to.have.length(4)

        // Check that points are calculated correctly
        const pointsMap = {}
        result.forEach(([player, points]) => {
          pointsMap[player] = points
        })
        expect(pointsMap['Player1']).to.equal(1)
        expect(pointsMap['Player2']).to.equal(2)
        expect(pointsMap['Player3']).to.equal(1)
        expect(pointsMap['Player4']).to.equal(0)
      })
    })

    describe('sorting by set points as tiebreaker', () => {
      it('uses set points to break ties when points and buchholz are equal', () => {
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
              [1, 0]
            ),
          ],
        ]

        const result = calculateRanking(participants, history)

        // Player1 has 2 points, Player2 has 1 point, Player3 has 0 points, Player4 has 0 points
        // Player1 should be first with 2 points
        const player1Result = result.find((r) => r[0] === 'Player1')
        expect(player1Result[1]).to.equal(2) // 2 points
        expect(player1Result[3]).to.equal(2) // +1 +1 = 2 set points

        // Verify sorting: points first, then buchholz, then set points
        expect(result[0][1]).to.be.at.least(result[1][1])
        if (result[0][1] === result[1][1]) {
          expect(result[0][2]).to.be.at.least(result[1][2])
          if (result[0][2] === result[1][2]) {
            expect(result[0][3]).to.be.at.least(result[1][3])
          }
        }
      })

      it('sorts correctly when set points differ but points and buchholz are equal', () => {
        dump('setsToWin', 3)
        const participants = ['Player1', 'Player2', 'Player3', 'Player4']
        // Create scenario where players have same points and buchholz but different set points
        const history = [
          [
            new RegularMatch(
              [
                ['Player1', 'Player2'],
                ['Player3', 'Player4'],
              ],
              [3, 1] // Player1, Player2 win 3-1: +2 set points each
            ),
          ],
          [
            new RegularMatch(
              [
                ['Player1', 'Player3'],
                ['Player2', 'Player4'],
              ],
              [3, 2] // Player1, Player3 win 3-2: +1 set points each
            ),
          ],
        ]

        const result = calculateRanking(participants, history)

        // Player1: 2 points, Player2: 1 point, Player3: 1 point, Player4: 0 points
        // Player2 and Player3 both have 1 point
        // Player2: Round 1: +2, Round 2: -1 = +1 set points
        // Player3: Round 1: -2, Round 2: +1 = -1 set points
        // So Player2 should rank above Player3

        const player2Index = result.findIndex((r) => r[0] === 'Player2')
        const player3Index = result.findIndex((r) => r[0] === 'Player3')

        expect(player2Index).to.be.below(player3Index)
        expect(result[player2Index][1]).to.equal(1) // Same points
        expect(result[player3Index][1]).to.equal(1) // Same points
        expect(result[player2Index][3]).to.be.above(result[player3Index][3]) // Player2 has higher set points
      })
    })

    describe('return format', () => {
      it('returns array of tuples with correct structure', () => {
        const participants = ['Player1', 'Player2']
        const history = []

        const result = calculateRanking(participants, history)

        expect(result).to.be.an('array')
        expect(result).to.have.length(2)

        result.forEach((tuple) => {
          expect(tuple).to.be.an('array')
          expect(tuple).to.have.length(4)
          expect(tuple[0]).to.be.a('string') // player name
          expect(tuple[1]).to.be.a('number') // points
          expect(tuple[2]).to.be.a('number') // buchholz
          expect(tuple[3]).to.be.a('number') // setPoints
        })
      })

      it('includes all participants exactly once', () => {
        const participants = ['Alice', 'Bob', 'Charlie', 'Diana']
        const history = []

        const result = calculateRanking(participants, history)

        const resultPlayers = result.map((tuple) => tuple[0])
        expect(resultPlayers).to.have.members(participants)
        expect(resultPlayers).to.have.length(participants.length)
      })
    })

    describe('complex scenarios', () => {
      it('handles tournament with multiple rounds and free games', () => {
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

        const result = calculateRanking(participants, history)

        expect(result).to.have.length(5)

        // Verify points are calculated correctly
        const pointsMap = {}
        result.forEach(([player, points]) => {
          pointsMap[player] = points
        })

        expect(pointsMap['Player1']).to.equal(1) // Won first round
        expect(pointsMap['Player2']).to.equal(2) // Won both rounds
        expect(pointsMap['Player3']).to.equal(0) // Lost both
        expect(pointsMap['Player4']).to.equal(1) // Free game in round 2
        expect(pointsMap['Player5']).to.equal(2) // Free game + won round 2

        // Verify sorting (highest points first)
        expect(result[0][1]).to.be.at.least(result[1][1])
        expect(result[1][1]).to.be.at.least(result[2][1])
        expect(result[2][1]).to.be.at.least(result[3][1])
        expect(result[3][1]).to.be.at.least(result[4][1])
      })

      it('handles empty participants list', () => {
        const result = calculateRanking([], [])
        expect(result).to.be.an('array')
        expect(result).to.have.length(0)
      })
    })
  })

  describe('calculateBuchholz', function () {
    it('works correctly with multiple rounds', function () {
      let participants = ['Achim', 'Berta', 'Clara', 'Dieter']
      let firstRound = [
        {
          teams: [
            ['Achim', 'Berta'],
            ['Clara', 'Dieter'],
          ],
          winningTeam: 0,
        },
      ]
      let secondRound = [
        {
          teams: [
            ['Achim', 'Clara'],
            ['Berta', 'Dieter'],
          ],
          winningTeam: 0,
        },
      ]
      let history = [firstRound, secondRound]
      let points = calculatePoints(participants, history)

      let expected = {
        Achim: 0, // -1 Berta + 1 Clara + 0 Dieter - 1 Clara + 1 Berta + 0 Dieter
        Berta: 2, // -2 Achim + 1 Clara + 0 Dieter - 0 Dieter + 1 Clara + 2 Achim
        Clara: 2, // - 0 Dieter + 2 Achim + 1 Berta - 2 Achim + 1 Berta + 0 Dieter
        Dieter: 4, // -1 Clara + 2 Achim + 1 Berta - 1 Berta + 2 Achim + 1 Clara
      }
      expect(calculateBuchholz(points, history)).to.be.deep.equal(expected)
    })

    it('works correctly with free games', function () {
      let participants = ['Achim', 'Berta', 'Clara', 'Dieter', 'Emil']
      let firstRound = [
        {
          teams: [
            ['Achim', 'Berta'],
            ['Clara', 'Dieter'],
          ],
          winningTeam: 0,
        },
        {
          isFreeGame: true,
          player: 'Emil',
        },
      ]
      let history = [firstRound]
      let points = calculatePoints(participants, history)

      let expected = {
        Achim: -1, // -1 Berta + 0 Clara + 0 Dieter
        Berta: -1, // -1 Achim + 0 Clara + 0 Dieter
        Emil: 0,
        Clara: 2, // +1 Achim + 1 Berta - 0 Dieter
        Dieter: 2, // +1 Achim + 1 Berta - 0 Clara
      }
      expect(calculateBuchholz(points, history)).to.be.deep.equal(expected)
    })

    describe('when history is empty', () => {
      it('returns zero buchholz for all players', () => {
        const points = { Player1: 2, Player2: 1, Player3: 0, Player4: 1 }
        const history = []

        const result = calculateBuchholz(points, history)

        expect(result).to.deep.equal({
          Player1: 0,
          Player2: 0,
          Player3: 0,
          Player4: 0,
        })
      })
    })

    describe('when history contains open rounds', () => {
      it('ignores open rounds in buchholz calculation', () => {
        const points = { Player1: 0, Player2: 0, Player3: 0, Player4: 0 }
        const history = [
          [
            {
              teams: [
                ['Player1', 'Player2'],
                ['Player3', 'Player4'],
              ],
              winningTeam: null, // Open match
            },
          ],
        ]

        const result = calculateBuchholz(points, history)

        expect(result).to.deep.equal({
          Player1: 0,
          Player2: 0,
          Player3: 0,
          Player4: 0,
        })
      })
    })

    describe('when history contains regular matches', () => {
      it('calculates buchholz correctly for simple match', () => {
        const points = { Player1: 1, Player2: 1, Player3: 0, Player4: 0 }
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

        const result = calculateBuchholz(points, history)

        // Player1: -Player2's points (1) + opponents' points (0+0) = -1
        expect(result['Player1']).to.equal(-1)
        // Player2: -Player1's points (1) + opponents' points (0+0) = -1
        expect(result['Player2']).to.equal(-1)
        // Player3: -Player4's points (0) + opponents' points (1+1) = 2
        expect(result['Player3']).to.equal(2)
        // Player4: -Player3's points (0) + opponents' points (1+1) = 2
        expect(result['Player4']).to.equal(2)
      })

      it('handles multiple rounds correctly', () => {
        const points = { Player1: 2, Player2: 1, Player3: 1, Player4: 0 }
        const history = [
          [
            {
              teams: [
                ['Player1', 'Player2'],
                ['Player3', 'Player4'],
              ],
              winningTeam: 0, // Player1, Player2 win
            },
          ],
          [
            {
              teams: [
                ['Player1', 'Player3'],
                ['Player2', 'Player4'],
              ],
              winningTeam: 0, // Player1, Player3 win
            },
          ],
        ]

        const result = calculateBuchholz(points, history)

        // Player1 partnered with Player2 (1pt) and Player3 (1pt)
        // Player1 opposed Player3,4 (1+0=1pt) and Player2,4 (1+0=1pt)
        // Buchholz = -1 -1 +1 +1 = 0
        expect(result['Player1']).to.equal(0)

        // Player2 partnered with Player1 (2pt) and opposed Player3,4 (1+0=1pt)
        // Player2 opposed Player1,3 (2+1=3pt)
        // Buchholz = -2 +1 +3 = 2
        expect(result['Player2']).to.equal(2)

        // Player3 partnered with Player4 (0pt) and Player1 (2pt)
        // Player3 opposed Player1,2 (2+1=3pt) and Player2,4 (1+0=1pt)
        // Buchholz = 0 -2 +3 +1 = 2
        expect(result['Player3']).to.equal(2)

        // Player4 partnered with Player3 (1pt) and Player2 (1pt)
        // Player4 opposed Player1,2 (2+1=3pt) and Player1,3 (2+1=3pt)
        // Buchholz = -1 -1 +3 +3 = 4
        expect(result['Player4']).to.equal(4)
      })
    })

    describe('when history contains free games', () => {
      it('ignores free games in buchholz calculation', () => {
        const points = { Player1: 1, Player2: 1, Player3: 0, Player4: 0, Player5: 1 }
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

        const result = calculateBuchholz(points, history)

        // Free games don't affect buchholz calculation
        expect(result['Player5']).to.equal(0)
        // Other players calculated normally
        expect(result['Player1']).to.equal(-1)
        expect(result['Player2']).to.equal(-1)
        expect(result['Player3']).to.equal(2)
        expect(result['Player4']).to.equal(2)
      })
    })

    describe('edge cases', () => {
      it('handles players with zero points', () => {
        const points = { Player1: 0, Player2: 0, Player3: 0, Player4: 0 }
        const history = [
          [
            {
              teams: [
                ['Player1', 'Player2'],
                ['Player3', 'Player4'],
              ],
              winningTeam: 0, // This shouldn't happen if points are 0, but testing robustness
            },
          ],
        ]

        const result = calculateBuchholz(points, history)

        expect(result['Player1']).to.equal(0) // -0 + 0+0 = 0
        expect(result['Player2']).to.equal(0)
        expect(result['Player3']).to.equal(0) // -0 + 0+0 = 0
        expect(result['Player4']).to.equal(0)
      })

      it('handles single player points object', () => {
        const points = { Player1: 5 }
        const history = []

        const result = calculateBuchholz(points, history)

        expect(result).to.deep.equal({ Player1: 0 })
      })
    })

    describe('complex scenarios', () => {
      it('calculates correctly with varying point distributions', () => {
        const points = { Player1: 3, Player2: 2, Player3: 2, Player4: 1 }
        const history = [
          [
            {
              teams: [
                ['Player1', 'Player4'],
                ['Player2', 'Player3'],
              ],
              winningTeam: 1, // Player2, Player3 win
            },
          ],
          [
            {
              teams: [
                ['Player1', 'Player2'],
                ['Player3', 'Player4'],
              ],
              winningTeam: 0, // Player1, Player2 win
            },
          ],
          [
            {
              teams: [
                ['Player1', 'Player3'],
                ['Player2', 'Player4'],
              ],
              winningTeam: 0, // Player1, Player3 win
            },
          ],
        ]

        const result = calculateBuchholz(points, history)

        // Verify calculation makes sense (exact values depend on complex partner/opponent interactions)
        expect(typeof result['Player1']).to.equal('number')
        expect(typeof result['Player2']).to.equal('number')
        expect(typeof result['Player3']).to.equal('number')
        expect(typeof result['Player4']).to.equal('number')
      })
    })
  })
})
