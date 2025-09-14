import { createManagePlayersDialog } from './managePlayersDialog.js'

import type {
  Player,
  Ranking,
  History,
  RankingRow,
  DepartedPlayersRecord,
} from '../types'
import { load } from '../storage'
import { groupBy } from '../utils'
import { htmlElement } from '../dom'
import {
  roundIsOpen,
  calculateRanking,
  calculateCurrentRound,
  tournamentHasStarted,
  tournamentHasFinished,
} from '../lib'

const titleDom = (title: string) =>
  htmlElement(
    'div',
    `
    <div class="flex"><h1 class="center">${title}</h1></div>
  `
  )

const headingDom = (round: number, tournamentIsOver: boolean) =>
  tournamentIsOver
    ? htmlElement(
        'div',
        `<div class=flex><h2 class="center">Endstand</h2></div>`
      )
    : htmlElement(
        'div',
        `
      <div class=flex>
        <h2 class="center">Zwischenstand nach Runde ${round}</h2>
      </div>
    `
      )

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

const tableDom = (
  rankingGroups: Ranking[],
  departedPlayers: DepartedPlayersRecord
): HTMLTableElement => {
  const dom = htmlElement('table', `<table class="result-table"></table>`)
  const rows: HTMLTableRowElement[] = []
  rows.push(
    htmlElement(
      'tr',
      `
      <tr>
        <th>Platz</th>
        <th>Name</th>
        <th>Punkte</th>
        <th>Buchholz</th>
      </tr>
    `
    )
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
        htmlElement(
          'tr',
          `
          <tr class="${dark ? 'dark' : 'bright'} ${
            isDeparted ? 'departed' : ''
          }">
            <td>${rank}</td>
            <td>${name}${departedText}</td>
            <td>${points}</td>
            <td>${buchholz}</td>
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
      [thisPlayer, thisPoints, thisBuchholz]: RankingRow,
      [thatPlayer, thatPoints, thatBuchholz]: RankingRow
    ) => thisPoints == thatPoints && thisBuchholz == thatBuchholz
  )
}

export const createRankingTable = (
  participants: Player[],
  history: History
) => {
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

  const dom = htmlElement('div', `<div id="ranking-table"></div>`)

  const tournamentFinished = tournamentHasFinished(history, roundCount)
  const showManageButton =
    tournamentHasStarted(history) && !tournamentHasFinished(history, roundCount)

  const elements: (HTMLDivElement | HTMLTableRowElement)[] = [
    titleDom(title),
    headingDom(rankedRound, tournamentFinished),
    ...(showManageButton ? [managePlayersButtonDom()] : []),
    tableDom(groups, departedPlayers),
  ]

  dom.replaceChildren(...elements)
  document.getElementById('tournament-data')!.replaceChildren(dom)
}
