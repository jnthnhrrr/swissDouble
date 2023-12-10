const createAlert = (message) => {
  message = message.trim()
  const id = randomId()
  const dom = domFromHTML(`
    <div id=${id} class="alert">
      <div class="alert-body">
        <div class="alert-message">
          ${message}
        </div>

        <div class="flex">
          <button
            id="action-close-alert"
            class="btn btn-action right"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  `)

  document.getElementById('universe').appendChild(dom)
  document.getElementById(id).addEventListener('click', () => destroyAlert(id))
}

const destroyAlert = (id) => {
  document.getElementById(id).remove()
}
