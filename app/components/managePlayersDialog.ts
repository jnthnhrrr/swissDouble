import { createAlert } from './alert.js'

import type { Player } from '../types.js'
import { htmlElement } from '../dom.js'
import { load, dump } from '../storage.js'
import { resetNextRound } from '../round.js'
import { calculateCurrentRound } from '../tournament.js'
import { calculateRanking, getRankingOrder } from '../ranking.js'

import { render } from '../app.js'

export const createManagePlayersDialog = () => {
  const participants = load('participants') || []
  const departedPlayers = load('departedPlayers') || {}
  const currentRound = calculateCurrentRound()

  const activePlayers = participants.filter(
    (player: Player) => !departedPlayers[player]
  )

  if (activePlayers.length === 0) {
    createAlert('Alle Spieler:innen haben das Turnier bereits verlassen.')
    return
  }

  const playerRows = activePlayers
    .map((player: Player) => {
      const rankingOrder = getRankingOrder()
      const ranking = calculateRanking(
        participants,
        load('history') || [],
        rankingOrder
      )
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

  dom.querySelectorAll('.remove-player-btn').forEach((element) => {
    const button = element as HTMLButtonElement
    button.addEventListener('click', (e) => {
      const player = (e.target as HTMLButtonElement).dataset.player as Player
      confirmRemovePlayer(player, currentRound - 1)
    })
  })

  dom
    .querySelector('#action-close-manage-players')!
    .addEventListener('click', destroyManagePlayersDialog)
}

const destroyManagePlayersDialog = () => {
  document.getElementById('manage-players-dialog')?.remove()
}

const confirmRemovePlayer = (player: Player, afterRound: number) => {
  const roundCount = load('roundCount') as number
  const activePlayers = (load('participants') || []).filter(
    (p: Player) => !(p in (load('departedPlayers') || {}))
  )

  const willCauseRoundCountIssue = roundCount === activePlayers.length

  let message = `
    Spieler:in "${player}" nach Runde ${afterRound} entfernen?

    Diese Aktion kann nicht rückgängig gemacht werden.
    Nach dieser Aktion wird die gegenwärtig offene Runde neu gesetzt.
    Stell sicher, dass die Runde noch nicht begonnen hat.
    Entferne die Spieler:in erst, wenn die Runde abgeschlossen ist.
  `

  if (willCauseRoundCountIssue) {
    message = `
      Spieler:in "${player}" nach Runde ${afterRound} entfernen?

      WARNUNG: Das Turnier hat derzeit ${roundCount} Runden und ${
        activePlayers.length
      } aktive Spieler:innen.
      Nach dem Entfernen dieser Spieler:in wird die Anzahl der Runden
      automatisch auf ${activePlayers.length - 1} reduziert,
      da die Anzahl der Runden die Anzahl der Teilnehmer:innen nicht
      überschreiten darf.

      Diese Aktion kann nicht rückgängig gemacht werden.
      Nach dieser Aktion wird die gegenwärtig offene Runde neu gesetzt.
      Stell sicher, dass die Runde noch nicht begonnen hat.
      Entferne die Spieler:in erst, wenn die Runde abgeschlossen ist.
    `
  }

  createAlert(message, () => removePlayer(player, afterRound))
}

const removePlayer = (player: Player, afterRound: number) => {
  const departedPlayers = load('departedPlayers') || {}
  departedPlayers[player] = afterRound
  dump('departedPlayers', departedPlayers)

  const roundCount = load('roundCount') as number
  const participants = load('participants') || []
  const newActivePlayers = participants.filter(
    (p: Player) => !(p in departedPlayers)
  )

  if (roundCount > newActivePlayers.length) {
    dump('roundCount', newActivePlayers.length)
  }

  destroyManagePlayersDialog()
  resetNextRound()
  render()
}
