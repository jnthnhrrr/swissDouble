const createOpenDialog = () => {
  destroyOpenDialog()
  const tournaments = Object.keys(load('savedTournaments') || {})
  if (!isTruthy(tournaments)) {
    return
  }
  const dialog = domFromHTML(`
    <div id="open-dialog" class="dropdown-dialog"></div>
  `)
  for (const tournament of tournaments) {
    const link = createOpenLink(tournament)
    dialog.appendChild(link)
  }
  const section = document.getElementById('open-tournament-section')
  section.appendChild(dialog)

  window.addEventListener(
    'click',
    (event) =>
      document
        .getElementById('open-tournament-section')
        .contains(event.target) || destroyOpenDialog()
  )
}

const destroyOpenDialog = () => document.getElementById('open-dialog')?.remove()

const createOpenLink = (tournamentKey) => {
  const link = domFromHTML(`
    <div class="dropdown-dialog-row action-open-tournament">
      ${tournamentKey}
    </div>
  `)
  link.addEventListener('click', () => {
    openTournament(tournamentKey)
    destroyOpenDialog()
  })

  return link
}
