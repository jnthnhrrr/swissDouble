import { dump } from '../storage.js'
import { readFromInputField, htmlElement } from '../dom.js'

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

        <div class="right">
          <div class="label">Runden</div>
          <input
            id="input-round-count"
            class="input"
            type="number"
            value="5"
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

  document
    .getElementById('action-start-tournament')!
    .addEventListener('click', startTournament)

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
