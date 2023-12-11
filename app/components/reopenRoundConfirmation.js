const createReopenRoundConfirmation = (roundNumber) => {
  const dom = domFromHTML(`
    <div id="reopen-round-confirmation">
      <div class="confirmation-body">
        <div class="confirmation-message">
          Die nächste Runde (Runde ${
            roundNumber + 1
          }) ist noch nicht festgeschrieben.

          Wenn du die Ergebnisse von Runde ${roundNumber} korrigierst, wird die
          Runde ${roundNumber + 1} neu gesetzt. Falls die Runde
          ${
            roundNumber + 1
          } schon begonnen hat, korrigiere die Ergebnisse von Runde
          ${roundNumber} erst dann, wenn Runde ${roundNumber + 1} beendet und
          festgeschrieben ist.
        </div>

        <div class="flex">
          <button
            id="action-reopen-round"
            class="btn btn-alert"
          >
            Ich möchte Runde ${roundNumber} korrigeren, und Runde ${
              roundNumber + 1
            } neu setzen.
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
  `)

  document.getElementById('universe').appendChild(dom)

  document
    .getElementById('action-reopen-round')
    .addEventListener('click', () => {
      reopenRound(roundNumber)
    })
  document
    .getElementById('action-abort-reopen-round')
    .addEventListener('click', destroyReopenRoundConfirmation)
}

const destroyReopenRoundConfirmation = () => {
  document.getElementById('reopen-round-confirmation')?.remove()
}

const reopenRound = (roundNumber) => {
  destroyReopenRoundConfirmation()
  dump('correctingRound', roundNumber)
  createRoundView(roundNumber)
}
