const createFreeGameDom = (match) =>
  domFromHTML(`
  <div class="match freegame flex">
    <div class="team">FREISPIEL</div>
    <div class="team">${match.player}</div>
  </div>
`)

const createRegularMatchDom = (match, openRound) => {
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

  const resultTeamOne = domFromHTML(`
    <button class="btn btn-result">${
      match.winningTeam == 0 ? 1 : match.winningTeam === null ? '?' : 0
    }</button>
  `)

  const resultTeamTwo = domFromHTML(`
    <button class="btn btn-result second">${
      match.winningTeam == 1 ? 1 : match.winningTeam === null ? '?' : 0
    }</button>
  `)
  if (openRound) {
    resultTeamOne.addEventListener('click', () => {
      setWinner(resultTeamOne, resultTeamTwo)
    })
    resultTeamTwo.addEventListener('click', () => {
      setWinner(resultTeamTwo, resultTeamOne)
    })
  }

  const result = domFromHTML(`<div class="result"></div>`)
  const conjunctor = domFromHTML(`<span class="conjunctor">:</span>`)

  result.appendChild(resultTeamOne)
  result.appendChild(conjunctor)
  result.appendChild(resultTeamTwo)

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
      ? matchDoms.push(createFreeGameDom(match))
      : matchDoms.push(createRegularMatchDom(match, roundIsOpen))
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
