const createHeader = () => {
  const dom = domFromHTML(`
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
  `)
  document.getElementById('header').replaceWith(dom)

  document
    .getElementById('action-create-tournament')
    .addEventListener('click', createTournament)

  document
    .getElementById('open-tournament-section')
    .addEventListener('click', createOpenDialog)

  document
    .getElementById('export-tournament-section')
    .addEventListener('click', exportTournament)

  document
    .getElementById('import-tournament-section')
    .addEventListener('click', openImportFileDialogue)

  document
    .getElementById('import-tournament-file-input')
    .addEventListener('change', importTournament)
}
