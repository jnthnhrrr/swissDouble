const titleDom = (title) =>
  domFromHTML(`
    <div class="flex"><h1 class="center">${title}</h1></div>
  `)

const headingDom = (round, tournamentIsOver) =>
  tournamentIsOver
    ? domFromHTML(`<div class=flex><h2 class="center">Endstand</h2></div>`)
    : domFromHTML(`
      <div class=flex>
        <h2 class="center">Zwischenstand nach Runde ${round}</h2>
      </div>
    `)

const managePlayersButtonDom = () => {
  const dom = domFromHTML(`
    <div class="flex">
      <button id="action-manage-players" class="btn btn-action center">
        Spieler verwalten
      </button>
    </div>
  `)

  dom
    .querySelector('#action-manage-players')
    .addEventListener('click', createManagePlayersDialog)

  return dom
}

const tableDom = (rankingGroups, departedPlayers) => {
  const dom = domFromHTML(`<table class="result-table"></table>`)
  const rows = []
  rows.push(
    domFromHTML(`
      <tr>
        <th>Platz</th>
        <th>Name</th>
        <th>Punkte</th>
        <th>Buchholz</th>
      </tr>
    `)
  )
  let rank = 1
  let dark = true
  for (const group of rankingGroups) {
    for (const [name, points, buchholz] of group) {
      const isDeparted = departedPlayers && departedPlayers[name] !== undefined
      const departedText = isDeparted
        ? ` (nach Runde ${departedPlayers[name]})`
        : ''

      rows.push(
        domFromHTML(`
          <tr class="${dark ? 'dark' : 'bright'} ${
            isDeparted ? 'departed' : ''
          }">
            <td>${rank}</td>
            <td>${name}${departedText}</td>
            <td>${points}</td>
            <td>${buchholz}</td>
          </tr>
        `)
      )
    }
    dark = !dark
    rank += group.length
  }
  dom.replaceChildren(...rows)
  return dom
}

const groupRankingByPointsAndBuchholz = (ranking) => {
  return groupBy(
    ranking,
    (
      [thisName, thisPoints, thisBuchholz],
      [thatName, thatPoints, thatBuchholz]
    ) => thisPoints == thatPoints && thisBuchholz == thatBuchholz
  )
}

const createRankingTable = (participants, history) => {
  if (!participants) return

  const ranking = calculateRanking(participants, history)
  const groups = groupRankingByPointsAndBuchholz(ranking)
  const title = load('title')
  const roundCount = load('roundCount')
  const currentRound = calculateCurrentRound()
  const departedPlayers = load('departedPlayers') || {}

  let rankedRound = 0
  if (currentRound) {
    rankedRound = roundIsOpen(history[currentRound - 1])
      ? currentRound - 1
      : currentRound
  }

  const dom = domFromHTML(`<div id="ranking-table"></div>`)

  const tournamentFinished = tournamentHasFinished(history, roundCount)
  const showManageButton =
    tournamentHasStarted(history) && !tournamentHasFinished(history, roundCount)

  const elements = [
    titleDom(title),
    headingDom(rankedRound, tournamentFinished),
    ...(showManageButton ? [managePlayersButtonDom()] : []),
    tableDom(groups, departedPlayers),
  ]

  dom.replaceChildren(...elements)
  document.getElementById('tournament-data').replaceChildren(dom)
}
