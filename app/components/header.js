const createHeader = () => {
  const dom = domFromHTML(`
    <div id="header" class="page">

      <div id="create-tournament-section" class="section">
        <button
          id="action-create-tournament"
          class="btn btn-action btn-green width-100"
        >
          Neu
        </button>
      </div>

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

    </div>
  `)
  document.getElementById('header').replaceWith(dom)

  document
    .getElementById('action-create-tournament')
    .addEventListener('click', createTournament)

  document
    .getElementById('open-tournament-section')
    .addEventListener('click', createOpenDialog)
}
