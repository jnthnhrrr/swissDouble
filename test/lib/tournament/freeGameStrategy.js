import { expect } from 'chai'
import { JSDOM } from 'jsdom'
import { storeTournament, openTournament } from '../../../dist/app.js'
import { dump, load } from '../../../dist/storage.js'
import { determineNextRound } from '../../../dist/round.js'

describe('freeGameStrategy in tournament storage', function () {
  before(() => {
    const dom = new JSDOM(
      '<!DOCTYPE html><html><body><div id="universe"><div id="tournament-data"></div><div id="header"></div></body></html>',
      { url: 'http://localhost' }
    )
    global.window = dom.window
    global.document = dom.window.document
    global.localStorage = dom.window.localStorage
  })

  afterEach(() => {
    localStorage.clear()
  })

  after(() => {
    delete global.window
    delete global.document
    delete global.localStorage
  })

  describe('storeTournament', function () {
    it('includes freeGameStrategy in saved tournament object', function () {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4']
      dump('participants', participants)
      dump('departedPlayers', {})
      dump('title', 'Test Tournament')
      dump('roundCount', 3)
      dump('freeGameStrategy', 'random')
      dump('history', [determineNextRound([])])

      storeTournament()

      const savedTournaments = load('savedTournaments')
      const tournament = savedTournaments['Test Tournament']

      expect(tournament).to.have.property('freeGameStrategy', 'random')
    })

    it('includes bottom-ranking strategy when saved', function () {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4']
      dump('participants', participants)
      dump('departedPlayers', {})
      dump('title', 'Test Tournament 2')
      dump('roundCount', 3)
      dump('freeGameStrategy', 'bottom-ranking')
      dump('history', [determineNextRound([])])

      storeTournament()

      const savedTournaments = load('savedTournaments')
      const tournament = savedTournaments['Test Tournament 2']

      expect(tournament).to.have.property('freeGameStrategy', 'bottom-ranking')
    })

    it('defaults to bottom-ranking when not set', function () {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4']
      dump('participants', participants)
      dump('departedPlayers', {})
      dump('title', 'Test Tournament 3')
      dump('roundCount', 3)
      dump('history', [determineNextRound([])])

      storeTournament()

      const savedTournaments = load('savedTournaments')
      const tournament = savedTournaments['Test Tournament 3']

      expect(tournament).to.have.property('freeGameStrategy', 'bottom-ranking')
    })
  })

  describe('openTournament', function () {
    it('loads freeGameStrategy from saved tournament', function () {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4']
      dump('participants', participants)
      dump('departedPlayers', {})
      const savedTournaments = {
        'Test Tournament': {
          title: 'Test Tournament',
          participants: participants,
          history: [determineNextRound([])],
          roundCount: 3,
          departedPlayers: {},
          freeGameStrategy: 'random',
        },
      }
      dump('savedTournaments', savedTournaments)

      openTournament('Test Tournament')

      expect(load('freeGameStrategy')).to.equal('random')
    })

    it('defaults to bottom-ranking for old tournaments without freeGameStrategy', function () {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4']
      dump('participants', participants)
      dump('departedPlayers', {})
      const savedTournaments = {
        'Old Tournament': {
          title: 'Old Tournament',
          participants: participants,
          history: [determineNextRound([])],
          roundCount: 3,
          departedPlayers: {},
        },
      }
      dump('savedTournaments', savedTournaments)

      openTournament('Old Tournament')

      expect(load('freeGameStrategy')).to.equal('bottom-ranking')
    })
  })
})
