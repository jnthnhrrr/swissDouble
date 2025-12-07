import { expect } from 'chai'
import { JSDOM } from 'jsdom'
import { setNextRound, determineNextRound } from '../../../dist/round.js'
import { dump, load } from '../../../dist/storage.js'

describe('setNextRound validation', function () {
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
    document.getElementById('universe').innerHTML =
      '<div id="tournament-data"></div><div id="header"></div>'
  })

  after(() => {
    delete global.window
    delete global.document
    delete global.localStorage
  })

  describe('nextRoundNumber validation', function () {
    it('prevents creating round when nextRoundNumber exceeds activeParticipants.length', function () {
      const participants = ['Player1', 'Player2', 'Player3']
      dump('participants', participants)
      dump('departedPlayers', {})
      dump('roundCount', 5)
      dump('setsToWin', 1)
      dump('freeGameStrategy', 'bottom-ranking')
      dump('pairingStrategy', 'power-pairing')

      const history = [
        [
          {
            teams: [['Player1', 'Player2']],
            setsWon: [1, 0],
            winningTeam: 0,
          },
          {
            isFreeGame: true,
            player: 'Player3',
          },
        ],
        [
          {
            teams: [['Player1', 'Player3']],
            setsWon: [1, 0],
            winningTeam: 0,
          },
          {
            isFreeGame: true,
            player: 'Player2',
          },
        ],
        [
          {
            teams: [['Player2', 'Player3']],
            setsWon: [1, 0],
            winningTeam: 0,
          },
          {
            isFreeGame: true,
            player: 'Player1',
          },
        ],
      ]
      dump('history', history)

      const historyBefore = load('history')
      setNextRound(history, 5)

      const alerts = document.querySelectorAll('.alert')
      expect(alerts.length).to.be.greaterThan(0)

      const alertMessage = alerts[0].querySelector('.alert-message').textContent
      expect(alertMessage).to.include('Warnung: Es wird versucht, Runde 4 zu erstellen')
      expect(alertMessage).to.include('aber es gibt nur 3 aktive Teilnehmer')

      const historyAfter = load('history')
      expect(historyAfter.length).to.equal(historyBefore.length)
    })

    it('allows creating round when nextRoundNumber equals activeParticipants.length', function () {
      const participants = ['Player1', 'Player2', 'Player3']
      dump('participants', participants)
      dump('departedPlayers', {})
      dump('roundCount', 3)
      dump('setsToWin', 1)
      dump('freeGameStrategy', 'bottom-ranking')
      dump('pairingStrategy', 'power-pairing')

      const firstRound = determineNextRound([])
      firstRound.forEach((match) => {
        if (!match.isFreeGame) {
          match.setsWon = [1, 0]
        }
      })

      const secondRound = determineNextRound([firstRound])
      secondRound.forEach((match) => {
        if (!match.isFreeGame) {
          match.setsWon = [1, 0]
        }
      })

      const history = [firstRound, secondRound]
      dump('history', history)

      const historyBefore = load('history')
      setNextRound(history, 3)

      const alerts = document.querySelectorAll('.alert')
      const validationAlerts = Array.from(alerts).filter((alert) => {
        const message = alert.querySelector('.alert-message')?.textContent || ''
        return (
          message.includes('Warnung: Es wird versucht, Runde') && message.includes('überschreiten')
        )
      })
      expect(validationAlerts.length).to.equal(0)

      const historyAfter = load('history')
      expect(historyAfter.length).to.equal(historyBefore.length + 1)
    })

    it('allows creating round when nextRoundNumber is less than activeParticipants.length', function () {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4', 'Player5']
      dump('participants', participants)
      dump('departedPlayers', {})
      dump('roundCount', 5)
      dump('setsToWin', 1)
      dump('freeGameStrategy', 'bottom-ranking')
      dump('pairingStrategy', 'power-pairing')

      const history = [
        [
          {
            teams: [
              ['Player1', 'Player2'],
              ['Player3', 'Player4'],
            ],
            setsWon: [1, 0],
            winningTeam: 0,
          },
          {
            isFreeGame: true,
            player: 'Player5',
          },
        ],
      ]
      dump('history', history)

      const historyBefore = load('history')
      setNextRound(history, 5)

      const alerts = document.querySelectorAll('.alert')
      const validationAlerts = Array.from(alerts).filter((alert) => {
        const message = alert.querySelector('.alert-message')?.textContent || ''
        return message.includes('Warnung: Es wird versucht, Runde')
      })
      expect(validationAlerts.length).to.equal(0)

      const historyAfter = load('history')
      expect(historyAfter.length).to.equal(historyBefore.length + 1)
    })

    it('respects departed players when checking activeParticipants.length', function () {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4']
      dump('participants', participants)
      dump('departedPlayers', { Player4: 1 })
      dump('roundCount', 5)
      dump('setsToWin', 1)
      dump('freeGameStrategy', 'bottom-ranking')
      dump('pairingStrategy', 'power-pairing')

      const history = [
        [
          {
            teams: [['Player1', 'Player2']],
            setsWon: [1, 0],
            winningTeam: 0,
          },
          {
            isFreeGame: true,
            player: 'Player3',
          },
        ],
        [
          {
            teams: [['Player1', 'Player3']],
            setsWon: [1, 0],
            winningTeam: 0,
          },
          {
            isFreeGame: true,
            player: 'Player2',
          },
        ],
        [
          {
            teams: [['Player2', 'Player3']],
            setsWon: [1, 0],
            winningTeam: 0,
          },
          {
            isFreeGame: true,
            player: 'Player1',
          },
        ],
      ]
      dump('history', history)

      const historyBefore = load('history')
      setNextRound(history, 5)

      const alerts = document.querySelectorAll('.alert')
      expect(alerts.length).to.be.greaterThan(0)

      const alertMessage = alerts[0].querySelector('.alert-message').textContent
      expect(alertMessage).to.include('Warnung: Es wird versucht, Runde 4 zu erstellen')
      expect(alertMessage).to.include('aber es gibt nur 3 aktive Teilnehmer')

      const historyAfter = load('history')
      expect(historyAfter.length).to.equal(historyBefore.length)
    })
  })
})
