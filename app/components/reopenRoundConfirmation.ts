import { createRoundView } from './roundView.js'

import { dump } from '../storage.js'
import { htmlElement } from '../dom.js'

export const createReopenRoundConfirmation = (
  roundNumber: number,
  openRoundNumber: number
) => {
  const dom = htmlElement(
    'div',
    `
    <div id="reopen-round-confirmation">
      <div class="confirmation-body">
        <div class="confirmation-message">
          Die Runde ${openRoundNumber} ist noch nicht festgeschrieben.

          Wenn du die Ergebnisse von Runde ${roundNumber} korrigierst, wird die
          Runde ${openRoundNumber} neu gesetzt. Falls die Runde
          ${openRoundNumber} schon begonnen hat, korrigiere die Ergebnisse von
          Runde ${roundNumber} erst dann, wenn Runde ${openRoundNumber} beendet
          und festgeschrieben ist.
        </div>

        <div class="flex">
          <button
            id="action-reopen-round"
            class="btn btn-alert"
          >
            Ich möchte Runde ${roundNumber} korrigeren, Runde ${openRoundNumber}
            wird neu gesetzt.
          </button>

          <button
            id="action-abort-reopen-round"
            class="btn right"
          >
            Abbrechen
          </button>
        </div>

      </div>
    </div>
  `
  )

  document.getElementById('universe')!.appendChild(dom)

  document
    .getElementById('action-reopen-round')!
    .addEventListener('click', () => {
      reopenRound(roundNumber)
    })
  document
    .getElementById('action-abort-reopen-round')!
    .addEventListener('click', destroyReopenRoundConfirmation)
}

export const destroyReopenRoundConfirmation = () => {
  document.getElementById('reopen-round-confirmation')?.remove()
}

export const reopenRound = (roundNumber: number) => {
  destroyReopenRoundConfirmation()
  dump('correctingRound', roundNumber)
  createRoundView(roundNumber)
}
