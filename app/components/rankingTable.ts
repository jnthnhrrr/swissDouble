import { createManagePlayersDialog } from './managePlayersDialog.js'

import type {
  Player,
  Ranking,
  History,
  RankingRow,
  DepartedPlayersRecord,
  RankingOrder,
  RankingParameter,
} from '../types.js'
import { load } from '../storage.js'
import { groupBy } from '../utils.js'
import { htmlElement } from '../dom.js'
import {
  calculateCurrentRound,
  tournamentHasStarted,
  tournamentHasFinished,
} from '../tournament.js'
import { calculateRanking, getRankingOrder } from '../ranking.js'
import { roundIsOpen } from '../round.js'
import { downloadRankingHTML } from './downloadRanking.js'

const titleDom = (title: string) =>
  htmlElement(
    'div',
    `
    <div class="flex"><h1 class="center">${title}</h1></div>
  `
  )

const headingDom = (
  round: number,
  tournamentIsOver: boolean,
  onDownload?: () => void
) => {
  if (tournamentIsOver) {
    const dom = htmlElement(
      'div',
      `<div class=flex><h2 class="center">Endstand <a href="#" id="download-ranking" style="font-size: 0.8em; font-weight: normal; text-decoration: none; color: var(--color-action);">(Download)</a></h2></div>`
    )
    if (onDownload) {
      const downloadLink = dom.querySelector('#download-ranking')!
      downloadLink.addEventListener('click', (e) => {
        e.preventDefault()
        onDownload()
      })
    }
    return dom
  } else {
    return htmlElement(
      'div',
      `
      <div class=flex>
        <h2 class="center">Zwischenstand nach Runde ${round}</h2>
      </div>
    `
    )
  }
}

const managePlayersButtonDom = () => {
  const dom = htmlElement(
    'div',
    `
    <div class="flex">
      <button id="action-manage-players" class="btn btn-action center">
        Spieler verwalten
      </button>
    </div>
  `
  )

  dom
    .querySelector('#action-manage-players')!
    .addEventListener('click', createManagePlayersDialog)

  return dom
}

export const getParameterLabel = (param: RankingParameter): string => {
  switch (param) {
    case 'points':
      return 'Punkte'
    case 'buchholz':
      return 'Buchholz'
    case 'setPoints':
      return 'Satzpunkte'
  }
}

export const getParameterValue = (
  row: RankingRow,
  param: RankingParameter
): string => {
  switch (param) {
    case 'points':
      return String(row[1])
    case 'buchholz':
      return String(row[2])
    case 'setPoints': {
      const value = row[3]
      return value > 0 ? `+${value}` : value < 0 ? `${value}` : '0'
    }
  }
}

const tableDom = (
  rankingGroups: Ranking[],
  departedPlayers: DepartedPlayersRecord,
  rankingOrder: RankingOrder
): HTMLTableElement => {
  const dom = htmlElement('table', `<table class="result-table"></table>`)
  const rows: HTMLTableRowElement[] = []

  const headerCells = [
    '<th>Platz</th>',
    '<th>Name</th>',
    ...rankingOrder.map((param) => `<th>${getParameterLabel(param)}</th>`),
  ]
  rows.push(htmlElement('tr', `<tr>${headerCells.join('')}</tr>`))

  let rank = 1
  let dark = true
  for (const group of rankingGroups) {
    for (const row of group) {
      const [name] = row
      const isDeparted = departedPlayers && departedPlayers[name] !== undefined
      const departedText = isDeparted
        ? ` (nach Runde ${departedPlayers[name]})`
        : ''

      const dataCells = [
        `<td>${rank}</td>`,
        `<td>${name}${departedText}</td>`,
        ...rankingOrder.map(
          (param) => `<td>${getParameterValue(row, param)}</td>`
        ),
      ]

      rows.push(
        htmlElement(
          'tr',
          `
          <tr class="${dark ? 'dark' : 'bright'} ${
            isDeparted ? 'departed' : ''
          }">
            ${dataCells.join('')}
          </tr>
        `
        )
      )
    }
    dark = !dark
    rank += group.length
  }
  dom.replaceChildren(...rows)
  return dom
}

const groupRankingByPointsAndBuchholz = (ranking: Ranking) => {
  return groupBy(
    ranking,
    (
      [thisPlayer, thisPoints, thisBuchholz, thisSetPoints]: RankingRow,
      [thatPlayer, thatPoints, thatBuchholz, thatSetPoints]: RankingRow
    ) =>
      thisPoints == thatPoints &&
      thisBuchholz == thatBuchholz &&
      thisSetPoints == thatSetPoints
  )
}

export const createRankingTable = (
  participants: Player[],
  history: History
) => {
  if (!participants) return

  const rankingOrder = getRankingOrder()
  const ranking = calculateRanking(participants, history, rankingOrder)
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

  const dom = htmlElement('div', `<div id="ranking-table"></div>`)

  const tournamentFinished = tournamentHasFinished(history, roundCount)
  const showManageButton =
    tournamentHasStarted(history) && !tournamentHasFinished(history, roundCount)

  const downloadHandler = tournamentFinished
    ? () => downloadRankingHTML(title, groups, departedPlayers, rankingOrder)
    : undefined

  const elements: (HTMLDivElement | HTMLTableRowElement)[] = [
    titleDom(title),
    headingDom(rankedRound, tournamentFinished, downloadHandler),
    ...(showManageButton ? [managePlayersButtonDom()] : []),
    tableDom(groups, departedPlayers, rankingOrder),
  ]

  dom.replaceChildren(...elements)
  document.getElementById('tournament-data')!.replaceChildren(dom)
}
