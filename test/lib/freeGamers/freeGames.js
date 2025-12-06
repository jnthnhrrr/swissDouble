import { expect } from 'chai'
import { calculateFreeGamers } from '../../../dist/freeGamers.js'

describe('Determination of Free Game', function () {
  let participants = [
    'Achim',
    'Berta',
    'Clara',
    'Dieter',
    'Emil',
    'Frieda',
    'Gerhard',
    'Hanna',
    'Ingo',
  ]

  let firstRound = [
    {
      teams: [
        ['Achim', 'Berta'],
        ['Clara', 'Dieter'],
      ],
      winningTeam: 0,
    },
    {
      teams: [
        ['Emil', 'Frieda'],
        ['Gerhard', 'Hanna'],
      ],
      winningTeam: 0,
    },
    {
      isFreeGame: true,
      player: 'Ingo',
    },
  ]
  let secondRound = [
    {
      teams: [
        ['Achim', 'Frieda'],
        ['Ingo', 'Gerhard'],
      ],
      winningTeam: 0,
    },
    {
      teams: [
        ['Emil', 'Dieter'],
        ['Clara', 'Hanna'],
      ],
      winningTeam: 0,
    },
    {
      isFreeGame: true,
      player: 'Hanna',
    },
  ]

  let history = [firstRound, secondRound]

  const playerHadFreeGame = (player, history) => {
    for (const round of history) {
      for (const match of round) {
        if (!('isFreeGame' in match)) {
          continue
        }
        if (match.player == player) {
          return true
        }
      }
    }
    return false
  }

  describe('calculateFreeGamers', function () {
    it('picks lowest ranked players without free game', function () {
      expect(calculateFreeGamers(participants, history)).to.be.deep.equal(['Clara'])
    })

    it('handles edge case: assigns second free games only after all players had at least one', function () {
      const participants5 = ['Player1', 'Player2', 'Player3', 'Player4', 'Player5']

      const history5Rounds = []
      const freeGameAssignments = []

      for (let round = 0; round < 5; round++) {
        const roundMatches = [
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
        ]
        history5Rounds.push(roundMatches)
        freeGameAssignments.push(`Player${(round % 5) + 1}`)
      }

      for (const player of participants5) {
        expect(playerHadFreeGame(player, history5Rounds)).to.be.true
      }

      const freeGamersRound6 = calculateFreeGamers(participants5, history5Rounds)

      expect(freeGamersRound6).to.have.length(1)

      expect(participants5).to.include(freeGamersRound6[0])

      const freeGamersRound7 = calculateFreeGamers(participants5, history5Rounds)
      expect(freeGamersRound7).to.have.length(1)
    })

    it('handles edge case with 6 players: fair distribution across many rounds', function () {
      const participants6 = ['Player1', 'Player2', 'Player3', 'Player4', 'Player5', 'Player6']

      const history3Rounds = []

      history3Rounds.push([
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
        {
          isFreeGame: true,
          player: 'Player6',
        },
      ])

      history3Rounds.push([
        {
          teams: [
            ['Player1', 'Player2'],
            ['Player5', 'Player6'],
          ],
          winningTeam: 0,
        },
        {
          isFreeGame: true,
          player: 'Player3',
        },
        {
          isFreeGame: true,
          player: 'Player4',
        },
      ])

      history3Rounds.push([
        {
          teams: [
            ['Player3', 'Player4'],
            ['Player5', 'Player6'],
          ],
          winningTeam: 0,
        },
        {
          isFreeGame: true,
          player: 'Player1',
        },
        {
          isFreeGame: true,
          player: 'Player2',
        },
      ])

      for (const player of participants6) {
        expect(playerHadFreeGame(player, history3Rounds)).to.be.true
      }

      const freeGamersRound4 = calculateFreeGamers(participants6, history3Rounds)

      expect(freeGamersRound4).to.have.length(2)

      freeGamersRound4.forEach((player) => {
        expect(participants6).to.include(player)
      })

      const freeGamersRound5 = calculateFreeGamers(participants6, history3Rounds)
      expect(freeGamersRound5).to.have.length(2)
    })
  })
})
