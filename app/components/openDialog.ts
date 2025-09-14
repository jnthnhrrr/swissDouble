import { load } from '../storage.js'
import { isTruthy } from '../utils.js'
import { htmlElement } from '../dom.js'

import { openTournament } from '../app'

export const createOpenDialog = () => {
  destroyOpenDialog()
  const tournaments = Object.keys(load('savedTournaments') || {})
  if (!isTruthy(tournaments)) {
    return
  }
  const dialog = htmlElement(
    'div',
    `
    <div id="open-dialog" class="dropdown-dialog"></div>
  `
  )
  for (const tournament of tournaments) {
    const link = createOpenLink(tournament)
    dialog.appendChild(link)
  }
  const section = document.getElementById(
    'open-tournament-section'
  ) as HTMLDivElement
  section.appendChild(dialog)

  window.addEventListener(
    'click',
    (event) =>
      document
        .getElementById('open-tournament-section')!
        .contains(event.target as Node) || destroyOpenDialog()
  )
}

const destroyOpenDialog = () => document.getElementById('open-dialog')?.remove()

const createOpenLink = (tournamentKey: string) => {
  const link = htmlElement(
    'div',
    `
    <div class="dropdown-dialog-row action-open-tournament">
      ${tournamentKey}
    </div>
  `
  )
  link.addEventListener('click', () => {
    openTournament(tournamentKey)
    destroyOpenDialog()
  })

  return link
}
