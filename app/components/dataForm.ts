import { dump } from '../storage.js'
import { readFromInputField, htmlElement } from '../dom.js'

import { startTournament } from '../app'

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

      <div class="label">Setzung</div>
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
