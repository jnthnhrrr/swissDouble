import { createAlert } from './alert'
import { highlightRoundNavItem } from './roundNavigation'
import {
  reopenRound,
  createReopenRoundConfirmation,
} from './reopenRoundConfirmation'

import type { FreeGameMatch, RegularMatch, Player, Points } from '../types'
import { resetNextRound, setNextRound } from '../round'
import { calculateCurrentRound, tournamentHasFinished } from '../tournament'
import { load, dump, erase } from '../storage'
import { isTruthy } from '../utils'
import { htmlElement } from '../dom'
import { calculatePoints } from '../ranking'

import { render } from '../app'

const freeGameDom = (match: FreeGameMatch, points: Record<Player, Points>) =>
  htmlElement(
    'div',
    `
    <div class="match freegame flex">
      <div class="team"><div class="fw-normal">FREISPIEL</div></div>
      <div class="team"><div class="player">${
        match.player
      } <span class="points">[${points[match.player]}]</span></div>
    </div>
  `
  )

const resultDom = (match: RegularMatch, editable: boolean) => {
  const dom = htmlElement('div', `<div class="result"></div>`)

  const teamOneResultDom = htmlElement(
    'button',
    `
    <button class="btn btn-result">${
      match.winningTeam == 0 ? 1 : match.winningTeam === null ? '?' : 0
    }</button>
  `
  )

  const teamTwoResultDom = htmlElement(
    'button',
    `
    <button class="btn btn-result second">${
      match.winningTeam == 1 ? 1 : match.winningTeam === null ? '?' : 0
    }</button>
  `
  )

  if (editable) {
    teamOneResultDom.addEventListener('click', () => {
      setWinner(teamOneResultDom, teamTwoResultDom)
    })
    teamTwoResultDom.addEventListener('click', () => {
      setWinner(teamTwoResultDom, teamOneResultDom)
    })
  }

  dom.appendChild(teamOneResultDom)
  dom.appendChild(htmlElement('span', `<span class="conjunctor">:</span>`))
  dom.appendChild(teamTwoResultDom)

  return dom
}

const setWinner = (thisDom: HTMLElement, thatDom: HTMLElement) => {
  thisDom.innerHTML = '1'
  thatDom.innerHTML = '0'
  thisDom.classList.add('set')
  thatDom.classList.add('set')
}

const regularMatchDom = (
  match: RegularMatch,
  editable: boolean,
  points: Record<Player, Points>
) => {
  const teamOne = htmlElement(
    'div',
    `
    <div class="team">
      <div class="player">${match.teams[0][0]} <span class="points">[${
        points[match.teams[0][0]]
      }]</span></div>
      <div class="player">${match.teams[0][1]} <span class="points">[${
        points[match.teams[0][1]]
      }]</span></div>
    </div>
  `
  )
  const teamTwo = htmlElement(
    'div',
    `
    <div class="team">
      <div class="player">${match.teams[1][0]} <span class="points">[${
        points[match.teams[1][0]]
      }]</span></div>
      <div class="player">${match.teams[1][1]} <span class="points">[${
        points[match.teams[1][1]]
      }]</span></div>
    </div>
  `
  )

  const result = resultDom(match, editable)

  const dom = htmlElement('div', `<div class="match"></div>`)

  dom.appendChild(teamOne)
  dom.appendChild(result)
  dom.appendChild(teamTwo)
  return dom
}

export const createRoundView = (focusedRound: number) => {
  destroyRoundView()
  const history = load('history')

  if (!isTruthy(history)) return

  const participants = load('participants')
  const roundCount = load('roundCount')
  const currentRound = calculateCurrentRound()
  const tournamentIsOver = tournamentHasFinished(history, roundCount)
  const tournamentIsNotOverYet = !tournamentIsOver

  const historyBeforeFocusedRound = history.slice(0, focusedRound - 1)
  const points = calculatePoints(participants, historyBeforeFocusedRound)

  const dom = htmlElement(
    'div',
    `<div id="round-view" class="page border"></div>`
  )

  const roundIsCurrent = focusedRound == currentRound
  const roundIsOpen = roundIsCurrent && tournamentIsNotOverYet
  const roundIsBeingCorrected = load('correctingRound') == focusedRound
  const roundIsEditable = roundIsOpen || roundIsBeingCorrected

  roundIsEditable
    ? dom.classList.add('editable-round')
    : dom.classList.add('fixed-round')

  const round = history[focusedRound - 1]

  let heading = htmlElement(
    'div',
    `
    <div class="flex"><h2 class="center">Runde ${focusedRound}</h2></div
  `
  )
  let matchDoms: HTMLDivElement[] = []
  for (const match of round) {
    'isFreeGame' in match
      ? matchDoms.push(freeGameDom(match, points))
      : matchDoms.push(regularMatchDom(match, roundIsEditable, points))
  }
  dom.replaceChildren(heading, ...matchDoms)

  if (roundIsEditable) {
    const closeButton = htmlElement(
      'div',
      `
      <div class="flex">
        <button
          id="action-fix-round"
          class="btn btn-action right"
        >
          Runde Festschreiben
        </button>
      </div>
    `
    )
    closeButton.addEventListener('click', () => {
      closeRound(focusedRound)
    })
    dom.appendChild(closeButton)
  } else {
    const reOpenButton = htmlElement(
      'div',
      `
      <div class="flex">
        <button
          id="action-attempt-reopen-round"
          class="btn btn-alert right"
        >
          Fehler korrigieren
        </button>
      </div>
    `
    )
    reOpenButton.addEventListener('click', () =>
      attemptReopenRound(focusedRound)
    )
    dom.appendChild(reOpenButton)
  }

  ;(document.getElementById('round-nav') as HTMLDivElement)!.after(dom)
  highlightRoundNavItem(focusedRound)
}

export const destroyRoundView = () =>
  document.getElementById('round-view')?.remove()

const closeRound = (roundNumber: number) => {
  const history = load('history')
  const roundCount = load('roundCount')
  const correctingThisRound = load('correctingRound') != undefined
  const participants = load('participants')

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
    // We are in a RegularMatch due to query selector above containing .result
    result.innerHTML == '1'
      ? ((round[index] as RegularMatch).winningTeam = 1)
      : ((round[index] as RegularMatch).winningTeam = 0)
    index++
  }

  history[roundNumber - 1] = round
  dump('history', history)
  if (correctingThisRound) {
    erase('correctingRound')
    resetNextRound(history, participants, roundCount)
  }
  setNextRound(history, participants, roundCount)
  render()
}

const attemptReopenRound = (roundNumber: number) => {
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
