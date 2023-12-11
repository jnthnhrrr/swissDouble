const freeGameDom = (match) =>
  domFromHTML(`
    <div class="match freegame flex">
      <div class="team">FREISPIEL</div>
      <div class="team">${match.player}</div>
    </div>
  `)

const resultDom = (match, changeable) => {
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

  if (changeable) {
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

const regularMatchDom = (match, openRound) => {
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

  const result = resultDom(match, openRound)

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

  const dom = domFromHTML(`<div id="round-view" class="page border"></div>`)

  focusedRound != currentRound || tournamentIsOver
    ? dom.classList.add('past-round')
    : dom.classList.add('current-round')

  const round = history[focusedRound - 1]

  let heading = domFromHTML(`
    <div class="flex"><h2 class="center">Runde ${focusedRound}</h2></div
  `)
  let matchDoms = []
  for (const match of round) {
    const roundIsOpen = focusedRound == currentRound && !tournamentIsOver
    match.isFreeGame
      ? matchDoms.push(freeGameDom(match))
      : matchDoms.push(regularMatchDom(match, roundIsOpen))
  }
  dom.replaceChildren(heading, ...matchDoms)

  if (focusedRound == calculateCurrentRound() && !tournamentIsOver) {
    const button = domFromHTML(`
      <div class="flex">
        <button
          id="action-fix-round"
          class="btn btn-action right"
        >
          Runde Festschreiben
        </button>
      </div>
    `)
    button.addEventListener('click', closeRound)
    dom.appendChild(button)
  } else {
    const reOpenButton = domFromHTML(`
      <div class="flex">
        <button
          id="action-reopen-round"
          class="btn btn-alert right"
        >
          Fehler korrigieren
        </button>
      </div>
    `)
    dom.appendChild(reOpenButton)
  }

  document.getElementById('round-nav')?.after(dom)
  highlightRoundNavItem(focusedRound)
}

const destroyRoundView = () => document.getElementById('round-view')?.remove()

const closeRound = () => {
  const history = load('history')
  const roundCount = load('roundCount')
  const setting = load('setting')

  const currentRound = calculateCurrentRound()
  const round = history[currentRound - 1]
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

  history[currentRound - 1] = round
  dump('history', history)
  setNextRound(history, setting, roundCount)
  render()
}
