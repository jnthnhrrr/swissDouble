window.onload = () => render()

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
  erase('history')
  erase('title')
  erase('participants')
  erase('setting')
  erase('roundCount')
  render()
}

const storeTournament = () => {
  const history = load('history')
  if (!tournamentHasStarted(history)) {
    return
  }
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

const openTournament = (key) => {
  storeTournament()

  const tournament = load('savedTournaments')[key]
  dump('history', tournament.history)
  dump('participants', tournament.participants)
  dump('roundCount', tournament.roundCount)
  dump('setting', tournament.setting)
  dump('title', tournament.title)
  render()
}
