import { createAlert } from './alert.js'
import { highlightRoundNavItem } from './roundNavigation.js'
import {
  reopenRound,
  createReopenRoundConfirmation,
} from './reopenRoundConfirmation.js'

import type { FreeGameMatch, RegularMatch, Player, Points } from '../types.js'
import {
  resetNextRound,
  setNextRound,
  roundIsOpen as checkRoundIsOpen,
} from '../round.js'
import { calculateCurrentRound, tournamentHasFinished } from '../tournament.js'
import { load, dump, erase, migrateHistory } from '../storage.js'
import { isTruthy } from '../utils.js'
import { htmlElement } from '../dom.js'
import { calculatePoints } from '../ranking.js'

import { render } from '../app.js'

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
  const setsToWin = load('setsToWin', 1) as number

  const displayValue = (value: number | null): string => {
    return value === null ? '?' : String(value)
  }

  const teamOneResultDom = htmlElement(
    'button',
    `
    <button class="btn btn-result">${displayValue(match.setsWon[0])}</button>
  `
  )

  const teamTwoResultDom = htmlElement(
    'button',
    `
    <button class="btn btn-result second">${displayValue(
      match.setsWon[1]
    )}</button>
  `
  )

  let matchElement: HTMLElement | null = null

  const updateVisualFeedback = () => {
    const team0Value = parseButtonValue(teamOneResultDom.innerHTML)
    const team1Value = parseButtonValue(teamTwoResultDom.innerHTML)

    teamOneResultDom.classList.remove('set')
    teamTwoResultDom.classList.remove('set')
    if (matchElement) {
      matchElement.classList.remove('tie')
      matchElement.classList.remove('invalid')
    }

    if (
      team0Value === setsToWin &&
      team1Value !== setsToWin &&
      team1Value !== null
    ) {
      teamOneResultDom.classList.add('set')
    } else if (
      team1Value === setsToWin &&
      team0Value !== setsToWin &&
      team0Value !== null
    ) {
      teamTwoResultDom.classList.add('set')
    } else if (
      team0Value !== null &&
      team1Value !== null &&
      team0Value === setsToWin &&
      team1Value === setsToWin
    ) {
      if (matchElement) {
        matchElement.classList.add('tie')
      }
    } else if (
      (team0Value !== null && team1Value === null) ||
      (team0Value === null && team1Value !== null) ||
      (team0Value !== null &&
        team1Value !== null &&
        team0Value !== setsToWin &&
        team1Value !== setsToWin)
    ) {
      if (matchElement) {
        matchElement.classList.add('invalid')
      }
    }
  }

  const setMatchElement = (element: HTMLElement) => {
    matchElement = element
    updateVisualFeedback()
  }

  if (editable) {
    teamOneResultDom.addEventListener('click', () => {
      incrementSets(teamOneResultDom, setsToWin)
      updateVisualFeedback()
    })
    teamTwoResultDom.addEventListener('click', () => {
      incrementSets(teamTwoResultDom, setsToWin)
      updateVisualFeedback()
    })
  }

  updateVisualFeedback()

  dom.appendChild(teamOneResultDom)
  dom.appendChild(htmlElement('span', `<span class="conjunctor">:</span>`))
  dom.appendChild(teamTwoResultDom)

  return {
    dom,
    setMatchElement,
    updateVisualFeedback,
  }
}

const parseButtonValue = (value: string): number | null => {
  if (value === '?') return null
  const num = Number(value)
  return isNaN(num) ? null : num
}

const incrementSets = (buttonDom: HTMLElement, setsToWin: number) => {
  const currentValue = parseButtonValue(buttonDom.innerHTML)
  let nextValue: number | null

  if (currentValue === null) {
    nextValue = 0
  } else if (currentValue === setsToWin) {
    nextValue = 0
  } else {
    nextValue = currentValue + 1
  }

  buttonDom.innerHTML = nextValue === null ? '?' : String(nextValue)
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
  dom.appendChild(result.dom)
  dom.appendChild(teamTwo)

  result.setMatchElement(dom)

  const setsToWin = load('setsToWin', 1) as number
  if (
    match.setsWon[0] !== null &&
    match.setsWon[1] !== null &&
    match.setsWon[0] === setsToWin &&
    match.setsWon[1] === setsToWin
  ) {
    dom.classList.add('tie')
  } else if (
    (match.setsWon[0] !== null && match.setsWon[1] === null) ||
    (match.setsWon[0] === null && match.setsWon[1] !== null) ||
    (match.setsWon[0] !== null &&
      match.setsWon[1] !== null &&
      match.setsWon[0] !== setsToWin &&
      match.setsWon[1] !== setsToWin)
  ) {
    dom.classList.add('invalid')
  }

  return dom
}

export const createRoundView = (focusedRound: number) => {
  destroyRoundView()
  let history = load('history')

  if (!isTruthy(history)) return

  // Ensure history is migrated before using it
  history = migrateHistory(history)

  const participants = load('participants')
  const roundCount = load('roundCount')
  const currentRound = calculateCurrentRound()
  const tournamentIsOver = tournamentHasFinished(history, roundCount)
  const tournamentIsNotOverYet = !tournamentIsOver

  // Calculate points up to and including the focused round if it's closed
  // Otherwise, calculate points up to (but not including) the focused round
  const focusedRoundIndex = focusedRound - 1
  const focusedRoundData = history[focusedRoundIndex]
  const isFocusedRoundClosed =
    focusedRoundData && !checkRoundIsOpen(focusedRoundData)

  const historyForPoints = isFocusedRoundClosed
    ? history.slice(0, focusedRound) // Include focused round if closed
    : history.slice(0, focusedRoundIndex) // Exclude focused round if open

  const points = calculatePoints(participants, historyForPoints)

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
  const setsToWin = load('setsToWin', 1) as number

  const round = history[roundNumber - 1]

  const resultButtons = document.querySelectorAll(
    '#round-view .match:not(.freegame) .result .btn-result'
  )

  let buttonIndex = 0
  for (let matchIndex = 0; matchIndex < round.length; matchIndex++) {
    const match = round[matchIndex]

    if ('isFreeGame' in match) {
      continue
    }

    const team0Button = resultButtons[buttonIndex] as HTMLElement
    const team1Button = resultButtons[buttonIndex + 1] as HTMLElement

    if (!team0Button || !team1Button) {
      createAlert(`
        Fehler beim Lesen der Ergebnisse.
      `)
      return
    }

    const team0Value = parseButtonValue(team0Button.innerHTML)
    const team1Value = parseButtonValue(team1Button.innerHTML)

    const team0HasWin =
      team0Value === setsToWin &&
      team1Value !== setsToWin &&
      team1Value !== null
    const team1HasWin =
      team1Value === setsToWin &&
      team0Value !== setsToWin &&
      team0Value !== null
    const isTie =
      team0Value !== null &&
      team1Value !== null &&
      team0Value === setsToWin &&
      team1Value === setsToWin
    const isPartialEntry =
      (team0Value !== null && team1Value === null) ||
      (team0Value === null && team1Value !== null)
    const isInvalid =
      team0Value !== null &&
      team1Value !== null &&
      team0Value !== setsToWin &&
      team1Value !== setsToWin

    if (isTie) {
      createAlert(`
        Die Runde kann noch nicht festgeschrieben werden,
        weil ein Unentschieden nicht erlaubt ist. Ein Team muss genau ${setsToWin} Sätze gewinnen.
      `)
      return
    }

    if (isPartialEntry) {
      createAlert(`
        Die Runde kann noch nicht festgeschrieben werden,
        weil noch Ergebnisse fehlen. Ein Team muss genau ${setsToWin} Sätze gewinnen.
      `)
      return
    }

    if (isInvalid) {
      createAlert(`
        Die Runde kann noch nicht festgeschrieben werden,
        weil noch Ergebnisse fehlen. Ein Team muss genau ${setsToWin} Sätze gewinnen.
      `)
      return
    }

    if (!team0HasWin && !team1HasWin) {
      createAlert(`
        Die Runde kann noch nicht festgeschrieben werden,
        weil noch Ergebnisse fehlen. Ein Team muss genau ${setsToWin} Sätze gewinnen.
      `)
      return
    }

    const regularMatch = match as RegularMatch
    // At this point, we've validated that there's a winner:
    // - Either team0HasWin or team1HasWin is true
    // - Both values are non-null (checked in validation: team0HasWin/team1HasWin require non-null)
    // - One team has setsToWin, the other doesn't
    // So we can safely set both values as numbers
    if (team0Value === null || team1Value === null) {
      createAlert(`
        Fehler: Unerwarteter Zustand beim Speichern der Ergebnisse.
      `)
      return
    }
    regularMatch.setsWon = [team0Value, team1Value] as [number, number]

    // Verify that winningTeam is now non-null (should never fail if validation was correct)
    if (regularMatch.winningTeam === null) {
      createAlert(`
        Fehler beim Speichern der Ergebnisse. Bitte versuchen Sie es erneut.
      `)
      return
    }

    buttonIndex += 2
  }

  history[roundNumber - 1] = round
  dump('history', history)
  if (correctingThisRound) {
    erase('correctingRound')
    resetNextRound()
  }
  setNextRound(history, roundCount)
  render()
}

const attemptReopenRound = (roundNumber: number) => {
  const history = load('history')
  const roundCount = load('roundCount')
  if (tournamentHasFinished(history, roundCount)) {
    reopenRound(roundNumber)
    return
  }
  const currentRoundNumber = calculateCurrentRound()
  createReopenRoundConfirmation(roundNumber, currentRoundNumber)
}
