import { createOpenDialog } from './openDialog.js'
import { htmlElement } from '../dom.js'
import { load } from '../storage.js'
import { isTruthy } from '../utils.js'

import {
  createTournament,
  importTournament,
  exportTournament,
  openImportFileDialogue,
} from '../app.js'

export const createHeader = () => {
  const savedTournaments = load('savedTournaments') || {}
  const hasSavedTournaments = isTruthy(Object.keys(savedTournaments))

  const openTournamentSection = hasSavedTournaments
    ? `
        <div id="open-tournament-section" class="section">
          <div class="width-100 relative">
            <div class="dropdown width-100">
              <button
                id="action-open-tournament"
                class="btn btn-action btn-yellow width-100"
              >
                Öffnen
              </button>
            </div>
          </div>
        </div>
      `
    : ''

  const dom = htmlElement(
    'div',
    `
    <div id="header" class="page">

      <div class="left-group">
        <div id="create-tournament-section" class="section">
          <button
            id="action-create-tournament"
            class="btn btn-action btn-green width-100"
          >
            Neu
          </button>
        </div>

        ${openTournamentSection}
      </div>

      <div class="right-group">
        <div id="export-tournament-section" class="section">
          <button
            id="action-export-tournament"
            class="btn btn-action width-100"
          >
            Exportieren
          </button>
        </div>

        <div id="import-tournament-section" class="section">
          <button
            id="action-import-tournament"
            class="btn btn-action width-100"
          >
            Importieren
          </button>
        </div>

        <input type="file" id="import-tournament-file-input" accept=".json" style="display: none;">

      </div>

    </div>
  `
  )
  document.getElementById('header')!.replaceWith(dom)

  document
    .getElementById('action-create-tournament')!
    .addEventListener('click', createTournament)

  const openTournamentButton = document.getElementById('action-open-tournament')
  if (openTournamentButton) {
    openTournamentButton.addEventListener('click', createOpenDialog)
  }

  document
    .getElementById('action-export-tournament')!
    .addEventListener('click', exportTournament)

  document
    .getElementById('action-import-tournament')!
    .addEventListener('click', openImportFileDialogue)

  document
    .getElementById('import-tournament-file-input')!
    .addEventListener('change', importTournament)
}
