import { dump, load } from '../storage.js'
import { readFromInputField, writeToInputField, htmlElement } from '../dom.js'
import type { RankingOrder, RankingParameter } from '../types.js'
import { getDefaultRankingOrder } from '../ranking.js'
import { startTournament } from '../app.js'

export const createDataForm = () => {
  const dataForm = htmlElement(
    'div',
    `
    <div id="data-form">
      <h1>Turnierdaten</h1>
      <div class="flex">
        <div class="flex-grow">
          <div class="label">Name</div>
          <input id="input-title" class="input" type="text" />
        </div>

        <div class="number-input-group">
          <div class="label">Runden</div>
          <input
            id="input-round-count"
            class="input input-number"
            type="number"
            value="5"
          />
        </div>

        <div class="number-input-group">
          <div class="label">Gewinnsätze</div>
          <input
            id="input-sets-to-win"
            class="input input-number"
            type="number"
            min="1"
            max="10"
            value="1"
          />
        </div>
      </div>

      <div class="flex">
        <div class="flex-section">
          <div class="label">Freilos-Vergabe</div>
          <div class="radio-group">
            <label class="radio-label">
              <input
                type="radio"
                name="free-game-strategy"
                value="bottom-ranking"
                id="radio-bottom-ranking"
                checked
              />
              Von Unten
            </label>
            <label class="radio-label">
              <input
                type="radio"
                name="free-game-strategy"
                value="random"
                id="radio-random"
              />
              Zufällig
            </label>
          </div>
        </div>

        <div class="flex-section">
          <div class="label">Setzung</div>
          <div class="radio-group">
            <label class="radio-label">
              <input
                type="radio"
                name="pairing-strategy"
                value="power-pairing"
                id="radio-power-pairing"
                checked
              />
              Power-Pairing ("Schweizer System")
            </label>
            <label class="radio-label">
              <input
                type="radio"
                name="pairing-strategy"
                value="random"
                id="radio-pairing-random"
              />
              Zufällig
            </label>
          </div>
        </div>
      </div>

      <div class="ranking-order-section" id="ranking-order-section" style="display: none;">
        <div class="label">Reihenfolge der Wertung</div>
        <div id="ranking-order-list" class="ranking-order-list"></div>
      </div>

      <div class="textarea-with-numbers">
        <div class="line-numbers" id="participants-line-numbers">1</div>
        <textarea id="input-participants" rows="8" type="text" class="input"></textarea>
      </div>

      <div class="flex">
        <button class="btn btn-action right" id="action-start-tournament">
          Turnier Starten
        </button>
      </div>
    </div>`
  )
  document.getElementById('tournament-data')!.replaceChildren(dataForm)
  setupLineNumbers()
  updateRankingOrderVisibility()

  document
    .getElementById('action-start-tournament')!
    .addEventListener('click', startTournament)

  document
    .getElementById('input-sets-to-win')!
    .addEventListener('change', () => {
      updateRankingOrderVisibility()
    })

  document
    .getElementById('input-participants')!
    .addEventListener('keyup', (event) => {
      if (event.key == 'Enter') {
        onParticipantInputChange()
      }
    })
}

const updateLineNumbers = () => {
  const textarea = document.getElementById(
    'input-participants'
  ) as HTMLTextAreaElement
  const lineNumbers = document.getElementById('participants-line-numbers')!
  const lines = textarea.value.split('\n')

  const numbers = []
  for (let i = 1; i <= lines.length; i++) {
    numbers.push(i.toString())
  }

  lineNumbers.textContent = numbers.join('\n')
}

const setupLineNumbers = () => {
  const textarea = document.getElementById(
    'input-participants'
  ) as HTMLTextAreaElement
  const lineNumbers = document.getElementById('participants-line-numbers')!

  const syncScroll = () => {
    lineNumbers.scrollTop = textarea.scrollTop
  }

  textarea.addEventListener('input', updateLineNumbers)
  textarea.addEventListener('scroll', syncScroll)
  textarea.addEventListener('paste', () => {
    setTimeout(updateLineNumbers, 10)
  })

  updateLineNumbers()
}

export const onParticipantInputChange = () => {
  const input = document.getElementById(
    'input-participants'
  ) as HTMLTextAreaElement
  let participants = readParticipants()
  updateLineNumbers()
  dump('participants', participants)
}

export const readParticipants = () =>
  readFromInputField('input-participants')
    .split('\n')
    .filter((line: string) => line.trim())

export const readTitle = () => readFromInputField('input-title')

export const readRoundCount = () =>
  Number(readFromInputField('input-round-count')) as number

export const readSetsToWin = () =>
  Number(readFromInputField('input-sets-to-win')) as number

export const writeSetsToWin = (setsToWin: number) => {
  writeToInputField('input-sets-to-win', String(setsToWin))
}

export const readFreeGameStrategy = (): 'bottom-ranking' | 'random' => {
  const bottomRankingRadio = document.getElementById(
    'radio-bottom-ranking'
  ) as HTMLInputElement
  if (bottomRankingRadio?.checked) {
    return 'bottom-ranking'
  }
  return 'random'
}

export const writeFreeGameStrategy = (
  strategy: 'bottom-ranking' | 'random'
) => {
  const bottomRankingRadio = document.getElementById(
    'radio-bottom-ranking'
  ) as HTMLInputElement
  const randomRadio = document.getElementById(
    'radio-random'
  ) as HTMLInputElement

  if (strategy === 'bottom-ranking') {
    if (bottomRankingRadio) bottomRankingRadio.checked = true
    if (randomRadio) randomRadio.checked = false
  } else {
    if (bottomRankingRadio) bottomRankingRadio.checked = false
    if (randomRadio) randomRadio.checked = true
  }
}

export const readPairingStrategy = (): 'power-pairing' | 'random' => {
  const powerPairingRadio = document.getElementById(
    'radio-power-pairing'
  ) as HTMLInputElement
  if (powerPairingRadio?.checked) {
    return 'power-pairing'
  }
  return 'random'
}

export const writePairingStrategy = (strategy: 'power-pairing' | 'random') => {
  const powerPairingRadio = document.getElementById(
    'radio-power-pairing'
  ) as HTMLInputElement
  const randomPairingRadio = document.getElementById(
    'radio-pairing-random'
  ) as HTMLInputElement

  if (strategy === 'power-pairing') {
    if (powerPairingRadio) powerPairingRadio.checked = true
    if (randomPairingRadio) randomPairingRadio.checked = false
  } else {
    if (powerPairingRadio) powerPairingRadio.checked = false
    if (randomPairingRadio) randomPairingRadio.checked = true
  }
}

const getParameterLabel = (param: RankingParameter): string => {
  switch (param) {
    case 'points':
      return 'Punkte'
    case 'buchholz':
      return 'Buchholz'
    case 'setPoints':
      return 'Satzpunkte'
  }
}

const getAvailableParameters = (): RankingParameter[] => {
  const setsToWin = readSetsToWin()
  if (setsToWin !== undefined && setsToWin !== null && setsToWin > 1) {
    return ['points', 'buchholz', 'setPoints']
  }
  return ['points', 'buchholz']
}

const shouldShowRankingOrder = (): boolean => {
  const setsToWin = readSetsToWin()
  return setsToWin !== undefined && setsToWin !== null && setsToWin > 1
}

const setupRankingOrder = () => {
  const container = document.getElementById('ranking-order-list')!
  if (!container) return
  const availableParams = getAvailableParameters()
  const currentOrder = readRankingOrder()

  const renderOrder = (order: RankingOrder) => {
    container.innerHTML = ''
    order.forEach((param, index) => {
      const row = htmlElement(
        'div',
        `
        <div class="ranking-order-item" data-param="${param}">
          <span class="ranking-order-number">${index + 1}.</span>
          <span class="ranking-order-label">${getParameterLabel(param)}</span>
          <div class="ranking-order-buttons">
            <button class="btn-ranking-order-up" ${
              index === 0 ? 'disabled' : ''
            } data-index="${index}">↑</button>
            <button class="btn-ranking-order-down" ${
              index === order.length - 1 ? 'disabled' : ''
            } data-index="${index}">↓</button>
          </div>
        </div>
      `
      )
      container.appendChild(row)
    })

    container.querySelectorAll('.btn-ranking-order-up').forEach((btn) => {
      btn.addEventListener('click', () => {
        const index = parseInt((btn as HTMLElement).dataset.index || '0')
        const newOrder = [...order]
        if (index > 0) {
          ;[newOrder[index - 1], newOrder[index]] = [
            newOrder[index],
            newOrder[index - 1],
          ]
          writeRankingOrder(newOrder)
          renderOrder(newOrder)
        }
      })
    })

    container.querySelectorAll('.btn-ranking-order-down').forEach((btn) => {
      btn.addEventListener('click', () => {
        const index = parseInt((btn as HTMLElement).dataset.index || '0')
        const newOrder = [...order]
        if (index < newOrder.length - 1) {
          ;[newOrder[index], newOrder[index + 1]] = [
            newOrder[index + 1],
            newOrder[index],
          ]
          writeRankingOrder(newOrder)
          renderOrder(newOrder)
        }
      })
    })
  }

  renderOrder(currentOrder)
}

const updateRankingOrderVisibility = () => {
  const section = document.getElementById('ranking-order-section')!
  if (!section) return
  if (shouldShowRankingOrder()) {
    section.style.display = 'block'
    setupRankingOrder()
  } else {
    section.style.display = 'none'
    const defaultOrder = getDefaultRankingOrder(readSetsToWin())
    writeRankingOrder(defaultOrder)
  }
}

export const readRankingOrder = (): RankingOrder => {
  const stored = load('rankingOrder')
  if (stored && Array.isArray(stored)) {
    const availableParams = getAvailableParameters()
    const filtered = stored.filter((p) => availableParams.includes(p))
    const missing = availableParams.filter((p) => !filtered.includes(p))
    return [...filtered, ...missing]
  }
  return getDefaultRankingOrder(readSetsToWin())
}

export const writeRankingOrder = (order: RankingOrder) => {
  dump('rankingOrder', order)
}
