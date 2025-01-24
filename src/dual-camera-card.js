import { LitElement, html, css } from "lit";

console.log("Dual Camera Card is being loaded...");

class DualCameraCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }
      .card-container {
        display: flex;
        flex-direction: row;
        gap: 8px;
        width: 100%;
      }
      .camera-container {
        flex: 1;
        position: relative;
        aspect-ratio: 16/9;
      }
      ha-camera-stream {
        width: 100%;
        height: 100%;
        border-radius: 4px;
      }
      .camera-error {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        text-align: center;
        padding: 16px;
      }
      .controls {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.3);
        padding: 8px;
        display: flex;
        justify-content: space-between;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
      }
      .camera-container:hover .controls {
        opacity: 1;
      }
      .mute-button {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      @media (max-width: 600px) {
        .card-container {
          flex-direction: column;
        }
      }
    `;
  }

  constructor() {
    super();
    this._muted = {
      camera1: true,
      camera2: true,
    };
  }

  setConfig(config) {
    if (!config.camera1 || !config.camera2) {
      throw new Error("Please define both camera entities");
    }
    this.config = config;
  }

  render() {
    if (!this.config || !this.hass) {
      return html``;
    }

    const camera1 = this.hass.states[this.config.camera1];
    const camera2 = this.hass.states[this.config.camera2];

    return html`
      <ha-card>
        <div class="card-container">
          ${this._renderCamera(camera1, this.config.camera1, "camera1")}
          ${this._renderCamera(camera2, this.config.camera2, "camera2")}
        </div>
      </ha-card>
    `;
  }

  _renderCamera(camera, entityId, cameraId) {
    if (!camera) {
      return html`
        <div class="camera-container">
          <div class="camera-error">Camera entity ${entityId} not found</div>
        </div>
      `;
    }

    return html`
      <div class="camera-container">
        <ha-camera-stream
          .hass=${this.hass}
          .stateObj=${camera}
          .muted=${this._muted[cameraId]}
          controls
          playsinline
          @click=${() => this._handleCameraClick(entityId)}
        ></ha-camera-stream>
        <div class="controls">
          <button
            class="mute-button"
            @click=${(e) => this._toggleMute(e, cameraId)}
          >
            <ha-icon
              icon=${this._muted[cameraId]
                ? "mdi:volume-off"
                : "mdi:volume-high"}
            ></ha-icon>
            ${this._muted[cameraId] ? "Unmute" : "Mute"}
          </button>
        </div>
      </div>
    `;
  }

  _toggleMute(e, cameraId) {
    e.stopPropagation();
    this._muted = {
      ...this._muted,
      [cameraId]: !this._muted[cameraId],
    };
    this.requestUpdate();
  }

  _handleCameraClick(entityId) {
    const event = new CustomEvent("hass-more-info", {
      detail: { entityId },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  static getConfigElement() {
    return document.createElement("dual-camera-card-editor");
  }

  static getStubConfig() {
    return {
      camera1: "",
      camera2: "",
    };
  }
}

class DualCameraCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
    };
  }

  static get styles() {
    return css`
      .form-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px;
      }
    `;
  }

  setConfig(config) {
    this.config = config;
  }

  render() {
    if (!this.hass || !this.config) {
      return html``;
    }

    const cameraEntities = Object.keys(this.hass.states)
      .filter((entityId) => entityId.startsWith("camera."))
      .sort();

    return html`
      <div class="form-container">
        <ha-select
          label="Camera 1"
          .value=${this.config.camera1}
          @selected=${this._camera1Changed}
        >
          ${cameraEntities.map(
            (entityId) => html`
              <ha-list-item value=${entityId}>
                ${this.hass.states[entityId].attributes.friendly_name ||
                entityId}
              </ha-list-item>
            `
          )}
        </ha-select>

        <ha-select
          label="Camera 2"
          .value=${this.config.camera2}
          @selected=${this._camera2Changed}
        >
          ${cameraEntities.map(
            (entityId) => html`
              <ha-list-item value=${entityId}>
                ${this.hass.states[entityId].attributes.friendly_name ||
                entityId}
              </ha-list-item>
            `
          )}
        </ha-select>
      </div>
    `;
  }

  _camera1Changed(ev) {
    if (!this.config || !ev.target.value) return;

    const newConfig = {
      ...this.config,
      camera1: ev.target.value,
    };

    const event = new CustomEvent("config-changed", {
      detail: { config: newConfig },
    });
    this.dispatchEvent(event);
  }

  _camera2Changed(ev) {
    if (!this.config || !ev.target.value) return;

    const newConfig = {
      ...this.config,
      camera2: ev.target.value,
    };

    const event = new CustomEvent("config-changed", {
      detail: { config: newConfig },
    });
    this.dispatchEvent(event);
  }
}

// Registreer beide componenten
customElements.define("dual-camera-card", DualCameraCard);
customElements.define("dual-camera-card-editor", DualCameraCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "dual-camera-card",
  name: "Dual Camera Card",
  description:
    "A card that displays two live camera feeds side by side with audio support",
});
