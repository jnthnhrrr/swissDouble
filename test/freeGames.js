let expect = require('chai').expect
let lib = require('../app/lib')

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
        expect(lib.playerHadFreeGame('Hanna', history)).to.be.true
        expect(lib.playerHadFreeGame('Ingo', history)).to.be.true
      })
    })

    describe('when player had no free game in multiple rounds', function () {
      it('returns false', function () {
        expect(lib.playerHadFreeGame('Achim', history)).to.be.false
        expect(lib.playerHadFreeGame('Berta', history)).to.be.false
        expect(lib.playerHadFreeGame('Clara', history)).to.be.false
        expect(lib.playerHadFreeGame('Dieter', history)).to.be.false
        expect(lib.playerHadFreeGame('Emil', history)).to.be.false
        expect(lib.playerHadFreeGame('Frieda', history)).to.be.false
        expect(lib.playerHadFreeGame('Gerhard', history)).to.be.false
      })
    })
  })

  describe('calculateFreeGamers', function () {
    it('picks lowest ranked players without free game', function () {
      expect(lib.calculateFreeGamers(participants, history)).to.be.deep.equal(
        new Set(['Clara'])
      )
    })
  })
})
