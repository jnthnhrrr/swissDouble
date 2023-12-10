let expect = require('chai').expect
var lib = require('../app/lib')

describe('Ranking', function () {
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
      expect(lib.calculatePoints(participants, history)).to.be.deep.equal(
        expected
      )
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
      expect(lib.calculatePoints(participants, history)).to.be.deep.equal(
        expected
      )
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
      let points = lib.calculatePoints(participants, history)

      let expected = {
        Achim: 0, // -1 Berta + 1 Clara + 0 Dieter - 1 Clara + 1 Berta + 0 Dieter
        Berta: 2, // -2 Achim + 1 Clara + 0 Dieter - 0 Dieter + 1 Clara + 2 Achim
        Clara: 2, // - 0 Dieter + 2 Achim + 1 Berta - 2 Achim + 1 Berta + 0 Dieter
        Dieter: 4, // -1 Clara + 2 Achim + 1 Berta - 1 Berta + 2 Achim + 1 Clara
      }
      expect(lib.calculateBuchholz(points, history)).to.be.deep.equal(expected)
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
      let points = lib.calculatePoints(participants, history)

      let expected = {
        Achim: -1, // -1 Berta + 0 Clara + 0 Dieter
        Berta: -1, // -1 Achim + 0 Clara + 0 Dieter
        Emil: 0,
        Clara: 2, // +1 Achim + 1 Berta - 0 Dieter
        Dieter: 2, // +1 Achim + 1 Berta - 0 Clara
      }
      expect(lib.calculateBuchholz(points, history)).to.be.deep.equal(expected)
    })
  })

  describe('calculateRanking', function () {
    describe('sorts by points and Buchholz', function () {
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

        let expected = [
          ['Achim', 2, 0],
          ['Berta', 1, 2],
          ['Clara', 1, 2],
          ['Dieter', 0, 4],
        ]

        expect(lib.calculateRanking(participants, history)).to.be.deep.equal(
          expected
        )
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

        let expected = [
          ['Emil', 1, 0],
          ['Achim', 1, -1],
          ['Berta', 1, -1],
          ['Clara', 0, 2],
          ['Dieter', 0, 2],
        ]
        expect(lib.calculateRanking(participants, history)).to.be.deep.equal(
          expected
        )
      })
    })
  })
})
