import { expect } from 'chai'
import { JSDOM } from 'jsdom'
import { startTournament } from '../../../dist/app.js'
import { dump, load } from '../../../dist/storage.js'
import {
  readParticipants,
  readRoundCount,
  onParticipantInputChange,
} from '../../../dist/components/dataForm.js'

describe('startTournament validation', function () {
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

  describe('roundCount validation', function () {
    it('prevents starting tournament when roundCount exceeds participants.length', function () {
      const participants = ['Player1', 'Player2', 'Player3']
      dump('participants', participants)
      dump('roundCount', 5)
      dump('history', [])
      dump('title', 'Test Tournament')
      dump('freeGameStrategy', 'bottom-ranking')
      dump('pairingStrategy', 'power-pairing')
      dump('setsToWin', 1)

      const dataForm = document.createElement('div')
      dataForm.id = 'data-form'
      dataForm.innerHTML = `
        <textarea id="input-participants">${participants.join('\n')}</textarea>
        <input id="input-round-count" value="5" />
        <input id="input-title" value="Test Tournament" />
        <input id="input-sets-to-win" value="1" />
        <input type="radio" name="free-game-strategy" value="bottom-ranking" checked />
        <input type="radio" name="pairing-strategy" value="power-pairing" checked />
      `
      document.getElementById('universe').appendChild(dataForm)

      const historyBefore = load('history')
      startTournament()

      const alerts = document.querySelectorAll('.alert')
      expect(alerts.length).to.be.greaterThan(0)

      const alertMessage = alerts[0].querySelector('.alert-message').textContent || ''
      expect(alertMessage).to.include('Die Anzahl der Runden')
      expect(alertMessage).to.include('Teilnehmer')
      expect(alertMessage).to.include('nicht überschreiten')

      const historyAfter = load('history') || []
      const historyAfterLength = Array.isArray(historyAfter) ? historyAfter.length : 0
      expect(historyAfterLength).to.equal(0)
    })

    it('allows starting tournament when roundCount equals participants.length', function () {
      const participants = ['Player1', 'Player2', 'Player3']
      dump('participants', participants)
      dump('roundCount', 3)
      dump('history', [])
      dump('title', 'Test Tournament')
      dump('freeGameStrategy', 'bottom-ranking')
      dump('pairingStrategy', 'power-pairing')
      dump('setsToWin', 1)

      const dataForm = document.createElement('div')
      dataForm.id = 'data-form'
      dataForm.innerHTML = `
        <div class="textarea-with-numbers">
          <div class="line-numbers" id="participants-line-numbers"></div>
          <textarea id="input-participants"></textarea>
        </div>
        <input id="input-round-count" value="3" />
        <input id="input-title" value="Test Tournament" />
        <input id="input-sets-to-win" value="1" />
        <input type="radio" name="free-game-strategy" value="bottom-ranking" checked />
        <input type="radio" name="pairing-strategy" value="power-pairing" checked />
      `
      document.getElementById('universe').appendChild(dataForm)

      const textarea = document.getElementById('input-participants')
      textarea.value = participants.join('\n')
      onParticipantInputChange()

      const historyBefore = load('history') || []
      const historyBeforeLength = Array.isArray(historyBefore) ? historyBefore.length : 0
      startTournament()

      const historyAfter = load('history') || []
      const historyAfterLength = Array.isArray(historyAfter) ? historyAfter.length : 0

      const alerts = document.querySelectorAll('.alert')
      const validationAlerts = Array.from(alerts).filter((alert) => {
        const message = alert.querySelector('.alert-message')?.textContent || ''
        return (
          message.includes('Die Anzahl der Runden') &&
          message.includes('nicht überschreiten') &&
          message.includes('überschreiten')
        )
      })

      if (validationAlerts.length > 0) {
        const alertMessage = validationAlerts[0].querySelector('.alert-message')?.textContent || ''
        throw new Error(`Unexpected validation alert: ${alertMessage}`)
      }

      expect(historyAfterLength).to.equal(historyBeforeLength + 1)
    })

    it('allows starting tournament when roundCount is less than participants.length', function () {
      const participants = ['Player1', 'Player2', 'Player3', 'Player4', 'Player5']
      dump('participants', participants)
      dump('roundCount', 3)
      dump('history', [])
      dump('title', 'Test Tournament')
      dump('freeGameStrategy', 'bottom-ranking')
      dump('pairingStrategy', 'power-pairing')
      dump('setsToWin', 1)

      const dataForm = document.createElement('div')
      dataForm.id = 'data-form'
      dataForm.innerHTML = `
        <div class="textarea-with-numbers">
          <div class="line-numbers" id="participants-line-numbers"></div>
          <textarea id="input-participants"></textarea>
        </div>
        <input id="input-round-count" value="3" />
        <input id="input-title" value="Test Tournament" />
        <input id="input-sets-to-win" value="1" />
        <input type="radio" name="free-game-strategy" value="bottom-ranking" checked />
        <input type="radio" name="pairing-strategy" value="power-pairing" checked />
      `
      document.getElementById('universe').appendChild(dataForm)

      const textarea = document.getElementById('input-participants')
      textarea.value = participants.join('\n')
      onParticipantInputChange()

      const historyBefore = load('history') || []
      const historyBeforeLength = Array.isArray(historyBefore) ? historyBefore.length : 0
      startTournament()

      const historyAfter = load('history') || []
      const historyAfterLength = Array.isArray(historyAfter) ? historyAfter.length : 0

      const alerts = document.querySelectorAll('.alert')
      const validationAlerts = Array.from(alerts).filter((alert) => {
        const message = alert.querySelector('.alert-message')?.textContent || ''
        return (
          message.includes('Die Anzahl der Runden') &&
          message.includes('nicht überschreiten') &&
          message.includes('überschreiten')
        )
      })

      if (validationAlerts.length > 0) {
        const alertMessage = validationAlerts[0].querySelector('.alert-message')?.textContent || ''
        throw new Error(`Unexpected validation alert: ${alertMessage}`)
      }

      expect(historyAfterLength).to.equal(historyBeforeLength + 1)
    })
  })
})
