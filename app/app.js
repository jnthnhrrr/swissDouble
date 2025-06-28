window.onload = () => render()

const STORAGE_KEYS = [
  'history',
  'participants',
  'roundCount',
  'setting',
  'title',
]

const render = () => {
  destroyRoundNavigation()
  destroyRoundView()

  const participants = load('participants') || []
  const history = load('history') || []
  const roundCount = load('roundCount')
  const title = load('title')

  createHeader()

  if (tournamentHasStarted(history)) {
    const setting = load('setting') || []

    createRankingTable(setting, history)
    createRoundNavigation(roundCount)
    createRoundView(calculateCurrentRound())
    return
  }

  createDataForm()
  dump('history', [])

  title && domWrite('input-title', load('title'))
  participants &&
    domWrite('input-participants', participants.join('\n')) &&
    onParticipantInputChange()
  roundCount &&
    domWrite('input-round-count', roundCount) &&
    createRoundNavigation(roundCount)
}

const startTournament = () => {
  const history = load('history') || []

  if (tournamentHasStarted(history)) return

  const participants = readParticipants()
  const duplicates = findDuplicates(participants)
  if (isTruthy(duplicates)) {
    createAlert(`
      Die folgenden Einträge tauchen doppelt auf:

          ${duplicates.join('\n')}

      Bitte ändere die Einträge, um sie zu vereindeutigen.
    `)
    return
  }

  const setting = drawSetting(participants)
  const roundCount = readRoundCount()
  dump('participants', participants)
  dump('setting', setting)
  dump('roundCount', roundCount)
  dump('title', readTitle())
  dump('history', history)

  setNextRound(history, setting, roundCount)
  render()
}

const createTournament = () => {
  storeTournament()
  for (const key of STORAGE_KEYS) {
    erase(key)
  }
  render()
}

const storeTournament = () => {
  const history = load('history')
  if (!tournamentHasStarted(history)) return

  const title = load('title')
  const tournament = {
    title: title,
    history: load('history'),
    participants: load('participants'),
    setting: load('setting'),
    roundCount: load('roundCount'),
  }
  let storeValue = load('savedTournaments') || {}
  storeValue[title] = tournament
  dump('savedTournaments', storeValue)
}

const openTournament = (title) => {
  storeTournament()

  const tournament = load('savedTournaments')[title]
  for (const key of STORAGE_KEYS) {
    dump(key, tournament[key])
  }
  render()
}

const downloadJSON = (data, filename) => {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const exportTournament = () => {
  const title = load('title')
  const data = {}

  for (const key of STORAGE_KEYS) {
    const value = load(key)
    if (value !== null) {
      data[key] = value
    }
  }
  downloadJSON(data, title + '.json')
}

const openImportFileDialogue = () => {
  document.getElementById('import-tournament-file-input').click()
}

const importTournament = (event) => {
  const file = event.target.files[0]

  if (!file) {
    return
  }

  const reader = new FileReader()
  reader.onload = function (e) {
    const data = JSON.parse(e.target.result)

    for (const key of Object.keys(data)) {
      const value = data[key]
      dump(key, value)
    }
    render()
  }
  reader.readAsText(file)
}
