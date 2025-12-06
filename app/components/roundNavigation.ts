import { createRoundView } from './roundView.js'
import { createAlert } from './alert.js'

import { htmlElement } from '../dom.js'
import {
  calculateCurrentRound,
  tournamentHasStarted,
  incrementRoundCount,
} from '../tournament.js'
import { load } from '../storage.js'
import { render } from '../app.js'

export const highlightRoundNavItem = (roundNumber: number) => {
  let items = document.getElementsByClassName('nav-round')
  for (let index = 1; index <= items.length; index++) {
    const item = items[index - 1]
    item.classList.remove('focus')
    if (index == roundNumber) {
      item.classList.add('focus')
    }
  }
}

export const createRoundNavigation = (focusedRound: number) => {
  const currentRound = calculateCurrentRound()
  const history = load('history', [])
  const tournamentStarted = tournamentHasStarted(history)

  let items = []
  for (let round = 1; round <= focusedRound; round++) {
    let navItem = htmlElement(
      'div',
      `
      <div
        class="
        nav-round
        ${currentRound == round ? 'current-round' : ''}
        ${currentRound < round ? 'future-round inactive' : ''}
        "
      >
        Runde ${round}
      </div>
    `
    )
    round <= currentRound &&
      navItem.addEventListener('click', () => {
        createRoundView(round)
      })
    items.push(navItem)
  }

  if (tournamentStarted) {
    const addRoundButton = htmlElement(
      'div',
      `
      <div class="nav-round add-round-button" id="add-round-button">
        +
      </div>
    `
    )
    addRoundButton.addEventListener('click', () => {
      confirmIncrementRoundCount()
    })
    items.push(addRoundButton)
  }

  destroyRoundNavigation()
  const dom = htmlElement('div', `<div id="round-nav"></div>`)
  dom.replaceChildren(...items)
  ;(document.getElementById('tournament-data') as HTMLDivElement)!.after(dom)
}

export const destroyRoundNavigation = () =>
  document.getElementById('round-nav')?.remove()

const confirmIncrementRoundCount = () => {
  const currentRoundCount = load('roundCount') as number
  createAlert(
    `
    Eine weitere Runde hinzufügen?

    Das Turnier wird von ${currentRoundCount} auf ${
      currentRoundCount + 1
    } Runden erweitert.
  `,
    () => {
      if (incrementRoundCount()) {
        render()
      }
    }
  )
}
