import { LitElement, html } from 'lit';
import style from './style.scss';

export class VoiceTriggerWorkflows extends LitElement {
  static get styles() {
    return [style]
  }

  static properties = {
    darkmode: {},
    configJSON: {},
    taskMap: {},
    taskSelected: {},
    _mainIsOpen: { state: true },
    _menuIsOpen: { state: true },
    _showBtn: { state: true },
    _config: { state: true },
    _selected: { sate: true }
  }

  constructor() {
    super();
    this.darkmode = null;
    this.configJSON = null;
    this.taskMap = null;
    this.taskSelected = null;
    this._theme = "";
    this._mainIsOpen = false;
    this._menuIsOpen = false;
    this._showBtn = false;
    this._config = null;
    this._selected = null;
  }


  connectedCallback() {
    super.connectedCallback()
    this._theme = this.setTheme();

    // Convert JSON proxy obj back into a JS Object
    this._config = JSON.parse(JSON.stringify(this.configJSON));
  }


  updated(changedProperties) {
    if (changedProperties.has('darkmode')) {
      this._theme = this.setTheme();
      this.requestUpdate();
    }

    if (changedProperties.has('taskSelected')) {
      if (this.taskSelected == null) {
        this._showBtn = false;
      } else if (this.taskSelected.mediaType == "telephony") {
        this._showBtn = true;
      } else {
        this._showBtn = false;
      }
    }

    // This is only needed for the dev HTML sandbox
    // The ConfigJSON does not change once loaded in the agent desktop 
    if (changedProperties.has('configJSON')) {
      this._config = JSON.parse(JSON.stringify(this.configJSON));
    }
  }


  setTheme() {
    return this.darkmode == 'true' ? "dark" : "light";
  }


  btnClicked() {
    if (this._mainIsOpen == false) {
      this._mainIsOpen = true;
      this._menuIsOpen = true;
    } else {
      this._mainIsOpen = false;
      this._menuIsOpen = false;
      if (this._selected) {
        this.cancelClicked();
      }
    }
  }


  menuClicked(event) {
    this._selected = event.target.getAttribute('data-id');
    this.shadowRoot.querySelector(`[data-modal-id="${this._selected}"]`).setAttribute("opened", "");
    this.shadowRoot.querySelector("#menu").removeAttribute("opened");
  }


  cancelClicked() {
    const id = this._selected;
    this.shadowRoot.querySelector(`[data-modal-id="${id}"]`).removeAttribute("opened");

    this._mainIsOpen = false;
    this._menuIsOpen = false;

    if (this._config[id].parameters) {
      this._config[id].parameters.forEach((param) => {
        if (param.type !== 'hidden') {
          this.shadowRoot.querySelector(`[data-id-input="${id}"][name="${param.name}"]`).value = "";
        }
      });
    }

    this._selected = null;
  }


  triggerClicked(event) {
    async function fetchWithTimeout(resource, options = {}) {
      const { timeout = 6000 } = options;
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      const response = await fetch(resource, { ...options, signal: controller.signal });
      clearTimeout(id);
      return response;
    }

    async function sendTrigger(url, body) {
      try {
        const response = await fetchWithTimeout(url, {
          timeout: 6000,
          method: 'POST',
          body: JSON.stringify(body),
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        console.log('voice-trigger-workflow Post Result:', response.status, data);

      } catch (error) {
        console.log('voice-trigger-workflow Post Error:', error);
      }
    }

    const id = event.target.getAttribute('data-id');

    let body = {};
    if (this._config[id].parameters) {
      this._config[id].parameters.forEach(param => {
        body[param.name] = this.shadowRoot.querySelector(`[data-id-input="${id}"][name="${param.name}"]`).value;
      });
    }

    let key = this.taskSelected.interactionId;
    let task = JSON.parse(JSON.stringify(this.taskMap.get(key)));

    body = { ...body, ...task };

    sendTrigger(this._config[id].url, body);
    this.cancelClicked();
  }


  modalSectionTemplate(action, index) {
    if (action.parameters) {
      return html`
        ${action.parameters.map(param => {

        if (param.type === 'input') {
          return html`
              <label>${param.label}</label>
              <input data-id-input="${index}" name="${param.name}" type="text">`
        }

        if (param.type === 'select') {
          return html`
              <label>${param.label}</label>
              <select data-id-input="${index}" name="${param.name}">
                ${param.values.map(value => html`<option>${value}</option>`)}
              </select>
             `
        }

        if (param.type === 'datetime') {
          return html`
              <label>${param.label}</label>
              <input type="datetime-local" data-id-input="${index}" name="${param.name}">
            `
        }

        if (param.type === 'hidden') {
          return html`
              <input type="hidden" data-id-input="${index}" name="${param.name}" value="${param.value}">
            `
        }

      })}
      `
    }
  }


  render() {
    return html`
      ${this._showBtn
        ? html`
          <div id="voice-trigger-workflow" .className=${this._theme}>
            <div id="btn" @click=${this.btnClicked}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09zM4.157 8.5H7a.5.5 0 0 1 .478.647L6.11 13.59l5.732-6.09H9a.5.5 0 0 1-.478-.647L9.89 2.41 4.157 8.5z"/></svg></div>
            <div id="main" ?opened=${this._mainIsOpen}>
              <div id="menu" ?opened=${this._menuIsOpen}>
                ${this._config.map((action, index) =>
          html`<p data-id="${index}" @click=${this.menuClicked}>${action.name}</p>`
        )}
              </div>
    
              ${this._config.map((action, index) =>
          html`
                  <div data-modal-id="${index}" class="modal">
                    <header>
                      <p>Trigger ${action.name}?</p>
                    </header>

                    <section>
                      ${this.modalSectionTemplate(action, index)}
                    </section>
                    
                    <footer>
                      <button data-id="${index}" @click=${this.cancelClicked} class="cancel-btn">Cancel</button>
                      <button data-id="${index}" @click=${this.triggerClicked} class="trigger-btn">Trigger</button>
                    </footer>
                  </div>
                `)}
            </div>
          </div>
      `
        : html``
      }`;
  }
}


customElements.define('voice-trigger-workflows', VoiceTriggerWorkflows);