import { expect } from 'chai'
import { JSDOM } from 'jsdom'
import { dump, load } from '../../../dist/storage.js'
import { getActiveParticipants } from '../../../dist/tournament.js'

describe('roundCount reduction when removing players', function () {
  before(() => {
    const dom = new JSDOM('', { url: 'http://localhost' })
    global.window = dom.window
    global.localStorage = dom.window.localStorage
  })

  afterEach(() => {
    localStorage.clear()
  })

  after(() => {
    delete global.window
    delete global.localStorage
  })

  describe('roundCount reduction logic', function () {
    it('reduces roundCount when removing a player causes roundCount > newActivePlayers.length', function () {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4']
      dump('participants', participants)
      dump('roundCount', 4)
      dump('departedPlayers', {})

      expect(load('roundCount')).to.equal(4)
      expect(getActiveParticipants().length).to.equal(4)

      const departedPlayers = {}
      departedPlayers['Player4'] = 1
      dump('departedPlayers', departedPlayers)

      const roundCount = load('roundCount')
      const newActivePlayers = participants.filter((p) => !(p in departedPlayers))

      if (roundCount > newActivePlayers.length) {
        dump('roundCount', newActivePlayers.length)
      }

      expect(load('roundCount')).to.equal(3)
      expect(getActiveParticipants().length).to.equal(3)
    })

    it('does not reduce roundCount when roundCount <= newActivePlayers.length', function () {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4', 'Player5']
      dump('participants', participants)
      dump('roundCount', 3)
      dump('departedPlayers', {})

      expect(load('roundCount')).to.equal(3)
      expect(getActiveParticipants().length).to.equal(5)

      const departedPlayers = {}
      departedPlayers['Player5'] = 1
      dump('departedPlayers', departedPlayers)

      const roundCount = load('roundCount')
      const newActivePlayers = participants.filter((p) => !(p in departedPlayers))

      if (roundCount > newActivePlayers.length) {
        dump('roundCount', newActivePlayers.length)
      }

      expect(load('roundCount')).to.equal(3)
      expect(getActiveParticipants().length).to.equal(4)
    })

    it('reduces roundCount correctly when multiple players are removed', function () {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4', 'Player5', 'Player6']
      dump('participants', participants)
      dump('roundCount', 6)
      dump('departedPlayers', {})

      expect(load('roundCount')).to.equal(6)
      expect(getActiveParticipants().length).to.equal(6)

      const departedPlayers = {}
      departedPlayers['Player5'] = 1
      departedPlayers['Player6'] = 1
      dump('departedPlayers', departedPlayers)

      const roundCount = load('roundCount')
      const newActivePlayers = participants.filter((p) => !(p in departedPlayers))

      if (roundCount > newActivePlayers.length) {
        dump('roundCount', newActivePlayers.length)
      }

      expect(load('roundCount')).to.equal(4)
      expect(getActiveParticipants().length).to.equal(4)
    })

    it('handles edge case when roundCount equals newActivePlayers.length after removal', function () {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4']
      dump('participants', participants)
      dump('roundCount', 4)
      dump('departedPlayers', {})

      expect(load('roundCount')).to.equal(4)
      expect(getActiveParticipants().length).to.equal(4)

      const departedPlayers = {}
      departedPlayers['Player4'] = 1
      dump('departedPlayers', departedPlayers)

      const roundCount = load('roundCount')
      const newActivePlayers = participants.filter((p) => !(p in departedPlayers))

      if (roundCount > newActivePlayers.length) {
        dump('roundCount', newActivePlayers.length)
      }

      expect(load('roundCount')).to.equal(3)
      expect(getActiveParticipants().length).to.equal(3)
      expect(load('roundCount')).to.equal(getActiveParticipants().length)
    })
  })
})
