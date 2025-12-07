import { expect } from 'chai'
import { JSDOM } from 'jsdom'
import { createRoundNavigation } from '../../../dist/components/roundNavigation.js'
import { dump, load } from '../../../dist/storage.js'
import { getActiveParticipants } from '../../../dist/tournament.js'

describe('roundNavigation add-round button visibility', function () {
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
    const nav = document.getElementById('round-nav')
    if (nav) nav.remove()
  })

  after(() => {
    delete global.window
    delete global.document
    delete global.localStorage
  })

  describe('add-round button visibility', function () {
    it('shows add-round button when roundCount < activeParticipants.length', function () {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4', 'Player5']
      dump('participants', participants)
      dump('departedPlayers', {})
      dump('roundCount', 3)
      dump('history', [
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
      ])
      dump('setsToWin', 1)

      createRoundNavigation(3)

      const addRoundButton = document.getElementById('add-round-button')
      expect(addRoundButton).to.not.be.null
      expect(addRoundButton.textContent.trim()).to.equal('+')
    })

    it('hides add-round button when roundCount == activeParticipants.length', function () {
      const participants = ['Player1', 'Player2', 'Player3']
      dump('participants', participants)
      dump('departedPlayers', {})
      dump('roundCount', 3)
      dump('history', [
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
      ])
      dump('setsToWin', 1)

      createRoundNavigation(3)

      const addRoundButton = document.getElementById('add-round-button')
      expect(addRoundButton).to.be.null
    })

    it('hides add-round button when roundCount > activeParticipants.length', function () {
      const participants = ['Player1', 'Player2', 'Player3']
      dump('participants', participants)
      dump('departedPlayers', {})
      dump('roundCount', 5)
      dump('history', [
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
      ])
      dump('setsToWin', 1)

      createRoundNavigation(5)

      const addRoundButton = document.getElementById('add-round-button')
      expect(addRoundButton).to.be.null
    })

    it('respects departed players when checking activeParticipants.length', function () {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4', 'Player5']
      dump('participants', participants)
      dump('departedPlayers', { Player5: 1 })
      dump('roundCount', 4)
      dump('history', [
        [
          {
            teams: [
              ['Player1', 'Player2'],
              ['Player3', 'Player4'],
            ],
            setsWon: [1, 0],
            winningTeam: 0,
          },
        ],
      ])
      dump('setsToWin', 1)

      const activeParticipants = getActiveParticipants()
      expect(activeParticipants.length).to.equal(4)

      createRoundNavigation(4)

      const addRoundButton = document.getElementById('add-round-button')
      expect(addRoundButton).to.be.null
    })

    it('shows add-round button when roundCount < activeParticipants.length after player removal', function () {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4', 'Player5']
      dump('participants', participants)
      dump('departedPlayers', { Player5: 1 })
      dump('roundCount', 3)
      dump('history', [
        [
          {
            teams: [
              ['Player1', 'Player2'],
              ['Player3', 'Player4'],
            ],
            setsWon: [1, 0],
            winningTeam: 0,
          },
        ],
      ])
      dump('setsToWin', 1)

      const activeParticipants = getActiveParticipants()
      expect(activeParticipants.length).to.equal(4)

      createRoundNavigation(3)

      const addRoundButton = document.getElementById('add-round-button')
      expect(addRoundButton).to.not.be.null
      expect(addRoundButton.textContent.trim()).to.equal('+')
    })

    it('does not show add-round button when tournament has not started', function () {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4', 'Player5']
      dump('participants', participants)
      dump('departedPlayers', {})
      dump('roundCount', 3)
      dump('history', [])
      dump('setsToWin', 1)

      createRoundNavigation(3)

      const addRoundButton = document.getElementById('add-round-button')
      expect(addRoundButton).to.be.null
    })
  })
})
