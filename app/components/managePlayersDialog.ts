import { createAlert } from './alert.js'

import type { Player } from '../types.js'
import { htmlElement } from '../dom.js'
import { load, dump } from '../storage.js'
import { resetNextRound } from '../round'
import { calculateCurrentRound } from '../tournament'
import { calculateRanking } from '../ranking'

import { render } from '../app.js'

export const createManagePlayersDialog = () => {
  const participants = load('participants') || []
  const departedPlayers = load('departedPlayers') || {}
  const currentRound = calculateCurrentRound()

  // Get active players (not yet departed)
  const activePlayers = participants.filter(
    (player: Player) => !departedPlayers[player]
  )

  if (activePlayers.length === 0) {
    createAlert('Alle Spieler haben das Turnier bereits verlassen.')
    return
  }

  const playerRows = activePlayers
    .map((player: Player) => {
      const ranking = calculateRanking(participants, load('history') || [])
      const playerRanking = ranking.find(([name]) => name === player)
      const points = playerRanking ? playerRanking[1] : 0

      return `
      <div class="manage-player-row">
        <div class="player-info">
          <div class="player-name">${player}</div>
          <div class="player-points">${points} Punkte</div>
        </div>
        <button class="btn btn-alert remove-player-btn" data-player="${player}">
          Entfernen
        </button>
      </div>
    `
    })
    .join('')

  const dom = htmlElement(
    'div',
    `
    <div id="manage-players-dialog" class="alert">
      <div class="alert-body manage-players-body">
        <h2>Spieler verwalten</h2>
        <div class="manage-players-subtitle">
          Entfernung nach Runde ${currentRound - 1}
        </div>

        <div class="manage-players-list">
          ${playerRows}
        </div>

        <div class="flex">
          <button id="action-close-manage-players" class="btn btn-action right">
            Schließen
          </button>
        </div>
      </div>
    </div>
  `
  )

  document.getElementById('universe')!.appendChild(dom)

  // Add event listeners for remove buttons
  dom.querySelectorAll('.remove-player-btn').forEach((element) => {
    const button = element as HTMLButtonElement
    button.addEventListener('click', (e) => {
      const player = (e.target as HTMLButtonElement).dataset.player as Player
      confirmRemovePlayer(player, currentRound - 1)
    })
  })

  // Close dialog listener
  dom
    .querySelector('#action-close-manage-players')!
    .addEventListener('click', destroyManagePlayersDialog)
}

const destroyManagePlayersDialog = () => {
  document.getElementById('manage-players-dialog')?.remove()
}

const confirmRemovePlayer = (player: Player, afterRound: number) => {
  createAlert(
    `
    Spieler "${player}" nach Runde ${afterRound} entfernen?

    Diese Aktion kann nicht rückgängig gemacht werden.
    Nach dieser Aktion wird die gegenwärtig offene Runde neu gesetzt.
    Stell sicher, dass die Runde noch nicht begonnen hat.
    Entferne den Spieler erst, wenn die Runde abgeschlossen ist.
  `,
    () => removePlayer(player, afterRound)
  )
}

const removePlayer = (player: Player, afterRound: number) => {
  const departedPlayers = load('departedPlayers') || {}
  departedPlayers[player] = afterRound
  dump('departedPlayers', departedPlayers)
  destroyManagePlayersDialog()
  resetNextRound()
  render() // Re-render to show updated rankings
}
