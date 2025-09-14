import { expect } from 'chai'
import { calculateFreeGamers, playerHadFreeGame } from '../../dist/lib.js'

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
  describe('playerHadFreeGame', function () {
    describe('when player had one free game in multiple rounds', function () {
      it('returns true', function () {
        expect(playerHadFreeGame('Hanna', history)).to.be.true
        expect(playerHadFreeGame('Ingo', history)).to.be.true
      })
    })

    describe('when player had no free game in multiple rounds', function () {
      it('returns false', function () {
        expect(playerHadFreeGame('Achim', history)).to.be.false
        expect(playerHadFreeGame('Berta', history)).to.be.false
        expect(playerHadFreeGame('Clara', history)).to.be.false
        expect(playerHadFreeGame('Dieter', history)).to.be.false
        expect(playerHadFreeGame('Emil', history)).to.be.false
        expect(playerHadFreeGame('Frieda', history)).to.be.false
        expect(playerHadFreeGame('Gerhard', history)).to.be.false
      })
    })
  })

  describe('calculateFreeGamers', function () {
    it('picks lowest ranked players without free game', function () {
      expect(calculateFreeGamers(participants, history)).to.be.deep.equal(new Set(['Clara']))
    })
  })
})
