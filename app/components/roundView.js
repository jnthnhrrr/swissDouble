const freeGameDom = (match) =>
  domFromHTML(`
    <div class="match freegame flex">
      <div class="team">FREISPIEL</div>
      <div class="team">${match.player}</div>
    </div>
  `)

const resultDom = (match, editable) => {
  const dom = domFromHTML(`<div class="result"></div>`)

  const teamOneResultDom = domFromHTML(`
    <button class="btn btn-result">${
      match.winningTeam == 0 ? 1 : match.winningTeam === null ? '?' : 0
    }</button>
  `)

  const teamTwoResultDom = domFromHTML(`
    <button class="btn btn-result second">${
      match.winningTeam == 1 ? 1 : match.winningTeam === null ? '?' : 0
    }</button>
  `)

  if (editable) {
    teamOneResultDom.addEventListener('click', () => {
      setWinner(teamOneResultDom, teamTwoResultDom)
    })
    teamTwoResultDom.addEventListener('click', () => {
      setWinner(teamTwoResultDom, teamOneResultDom)
    })
  }

  dom.appendChild(teamOneResultDom)
  dom.appendChild(domFromHTML(`<span class="conjunctor">:</span>`))
  dom.appendChild(teamTwoResultDom)

  return dom
}

const setWinner = (thisDom, thatDom) => {
  thisDom.innerHTML = 1
  thatDom.innerHTML = 0
  thisDom.classList.add('set')
  thatDom.classList.add('set')
}

const regularMatchDom = (match, editable) => {
  const teamOne = domFromHTML(`
    <div class="team">
      <div class="player">${match.teams[0][0]}</div>
      <div class="player">${match.teams[0][1]}</div>
    </div>
  `)
  const teamTwo = domFromHTML(`
    <div class="team">
      <div class="player">${match.teams[1][0]}</div>
      <div class="player">${match.teams[1][1]}</div>
    </div>
  `)

  const result = resultDom(match, editable)

  const dom = domFromHTML(`<div class="match"></div>`)

  dom.appendChild(teamOne)
  dom.appendChild(result)
  dom.appendChild(teamTwo)
  return dom
}

const createRoundView = (focusedRound) => {
  destroyRoundView()
  const history = load('history')

  if (!isTruthy(history)) return

  const roundCount = load('roundCount')
  const currentRound = calculateCurrentRound()
  const tournamentIsOver = tournamentHasFinished(history, roundCount)
  const tournamentIsNotOverYet = !tournamentIsOver

  const dom = domFromHTML(`<div id="round-view" class="page border"></div>`)

  const roundIsCurrent = focusedRound == currentRound
  const roundIsOpen = roundIsCurrent && tournamentIsNotOverYet
  const roundIsBeingCorrected = load('correctingRound') == focusedRound
  const roundIsEditable = roundIsOpen || roundIsBeingCorrected

  roundIsEditable
    ? dom.classList.add('editable-round')
    : dom.classList.add('fixed-round')

  const round = history[focusedRound - 1]

  let heading = domFromHTML(`
    <div class="flex"><h2 class="center">Runde ${focusedRound}</h2></div
  `)
  let matchDoms = []
  for (const match of round) {
    match.isFreeGame
      ? matchDoms.push(freeGameDom(match))
      : matchDoms.push(regularMatchDom(match, roundIsEditable))
  }
  dom.replaceChildren(heading, ...matchDoms)

  if (roundIsEditable) {
    const closeButton = domFromHTML(`
      <div class="flex">
        <button
          id="action-fix-round"
          class="btn btn-action right"
        >
          Runde Festschreiben
        </button>
      </div>
    `)
    closeButton.addEventListener('click', () => {
      closeRound(focusedRound)
    })
    dom.appendChild(closeButton)
  } else {
    const reOpenButton = domFromHTML(`
      <div class="flex">
        <button
          id="action-attempt-reopen-round"
          class="btn btn-alert right"
        >
          Fehler korrigieren
        </button>
      </div>
    `)
    reOpenButton.addEventListener('click', () =>
      attemptReopenRound(focusedRound)
    )
    dom.appendChild(reOpenButton)
  }

  document.getElementById('round-nav')?.after(dom)
  highlightRoundNavItem(focusedRound)
}

const destroyRoundView = () => document.getElementById('round-view')?.remove()

const closeRound = (roundNumber) => {
  const history = load('history')
  const setting = load('setting')
  const roundCount = load('roundCount')
  const correctingThisRound = load('correctingRound') != undefined

  const round = history[roundNumber - 1]
  let index = 0
  for (const result of document.querySelectorAll(
    '.match .result .btn-result.second'
  )) {
    if (result.innerHTML == '?') {
      createAlert(`
        Die Runde kann noch nicht festgeschrieben werden,
        weil noch Ergebnisse fehlen.
      `)
      return
    }
    result.innerHTML == '1'
      ? (round[index].winningTeam = 1)
      : (round[index].winningTeam = 0)
    index++
  }

  history[roundNumber - 1] = round
  dump('history', history)
  if (correctingThisRound) {
    erase('correctingRound')
    resetNextRound(history, setting, roundCount)
  }
  setNextRound(history, setting, roundCount)
  render()
}

const attemptReopenRound = (roundNumber) => {
  // reopening the round is safe if all rounds are closed, or if this is the
  // last round. Else, changing results would lead to recalculating the setting
  // of the open round. This would be a problem if the open round
  // already started (but has not been closed yet). That is why the user cannot
  // reopen the the round directly, but has to confirm their intent for the open
  // round to be reset.
  const history = load('history')
  const roundCount = load('roundCount')
  if (tournamentHasFinished(history, roundCount)) {
    reopenRound(roundNumber)
    return
  }
  const currentRoundNumber = calculateCurrentRound()
  createReopenRoundConfirmation(roundNumber, currentRoundNumber)
}
