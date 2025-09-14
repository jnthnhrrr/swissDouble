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
      <textarea id="input-participants" rows=8 type="text" class="input"></textarea>

      <div class="flex">
        <button class="btn btn-action right" id="action-start-tournament">
          Turnier Starten
        </button>
      </div>
    </div>
  `
  )
  document.getElementById('tournament-data')!.replaceChildren(dataForm)

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

export const onParticipantInputChange = () => {
  // Adapt textarea size whenever input changes
  const input = document.getElementById(
    'input-participants'
  ) as HTMLTextAreaElement
  let participants = readParticipants()
  dump('participants', participants)
  input.rows = Math.max(input.rows, participants.length + 2)
}

export const readParticipants = () =>
  readFromInputField('input-participants')
    .split('\n')
    .filter((line: string) => line.trim())

export const readTitle = () => readFromInputField('input-title')

export const readRoundCount = () =>
  Number(readFromInputField('input-round-count')) as number
