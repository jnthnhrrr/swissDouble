import { createRoundView } from './roundView'

import { htmlElement } from '../dom'
import { calculateCurrentRound } from '../tournament'

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
  destroyRoundNavigation()
  const dom = htmlElement('div', `<div id="round-nav"></div>`)
  dom.replaceChildren(...items)
  ;(document.getElementById('tournament-data') as HTMLDivElement)!.after(dom)
}

export const destroyRoundNavigation = () =>
  document.getElementById('round-nav')?.remove()
