const createAlert = (message, callback = null) => {
  message = message.trim()
  const id = randomId()

  if (callback) {
    const dom = domFromHTML(`
      <div id=${id} class="alert">
        <div class="alert-body">
          <div class="alert-message">
            ${message}
          </div>
          <div class="flex">
            <button
              id="action-confirm-alert-${id}"
              class="btn btn-alert"
            >
              Ja
            </button>
            <button
              id="action-cancel-alert-${id}"
              class="btn btn-action right"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    `)

    document.getElementById('universe').appendChild(dom)

    document
      .getElementById(`action-confirm-alert-${id}`)
      .addEventListener('click', () => {
        destroyAlert(id)
        callback()
      })

    document
      .getElementById(`action-cancel-alert-${id}`)
      .addEventListener('click', () => {
        destroyAlert(id)
      })
  } else {
    const dom = domFromHTML(`
      <div id=${id} class="alert">
        <div class="alert-body">
          <div class="alert-message">
            ${message}
          </div>
          <div class="flex">
            <button
              id="action-close-alert-${id}"
              class="btn btn-action right"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    `)

    document.getElementById('universe').appendChild(dom)

    document
      .getElementById(`action-close-alert-${id}`)
      .addEventListener('click', () => destroyAlert(id))
    document.getElementById(id).addEventListener('click', (e) => {
      if (e.target.id === id) destroyAlert(id)
    })
  }
}

const destroyAlert = (id) => {
  document.getElementById(id)?.remove()
}
