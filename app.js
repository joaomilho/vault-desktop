const { clipboard } = require('electron')
const Vault = require('vault')
const html = require('choo/html')
const choo = require('choo')

const genPassword = ({ phrase, service }) =>
  service && phrase ? new Vault({ phrase }).generate(service) : null

const service = (state, emit) => html`
  <section id="service">
    <label for="serviceField">Service</label>
    <input tabindex="1" value="${state.service}" oninput=${(e) => emit('update', { service: e.target.value })} autofocus type="text" id="serviceField" autocomplete="off" autocapitalize="off">
  </section>
`

const type = (state) => state.showPassphrase ? 'text' : 'password'
const label = (state) => state.showPassphrase ? 'Hide' : 'Show'
const passphrase = (state, emit) => html`
    <section id="phrase">
      <label for="phraseField">Passphrase</label>
      <button id="toggleVisibility" onclick=${() => emit('update', { showPassphrase: !state.showPassphrase })}>${label(state)}</button>
      <input tabindex="2" value="${state.phrase}" oninput=${(e) => emit('update', { phrase: e.target.value })} type="${type(state)}" id="phraseField" autocomplete="off" autocapitalize="off">
    </section>
`

const clipboardMessage = ui => html`
  <section id="password">
    <div>
      ${ui.showClipboardMessage ? 'Password copied to clipboard' : ''}
    </div>
  </section>
`

const main = ({ ui }, emit) => html`
  <main>
    ${service(ui, emit)}
    ${passphrase(ui, emit)}
    ${clipboardMessage(ui)}
  </main>
`

const store = (state, emitter) => {
  state.ui = {
    service: '',
    phrase: '',
    showPassphrase: false,
    showClipboardMessage: false,
  }

  emitter.on('update', function(update) {
    state.ui = Object.assign(state.ui, update)
    const password = genPassword(state.ui)

    if (password) {
      clipboard.writeText(password)
      state.ui.showClipboardMessage = true
    } else {
      state.ui.showClipboardMessage = false
    }
    emitter.emit('render')
  })
}

const app = choo()
app.use(store)
app.route('/', main)
app.mount('main')