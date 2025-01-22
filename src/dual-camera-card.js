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
      .camera-feed {
        width: 100%;
        height: 100%;
        object-fit: cover;
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
      @media (max-width: 600px) {
        .card-container {
          flex-direction: column;
        }
      }
    `;
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
          ${this._renderCamera(camera1, this.config.camera1)}
          ${this._renderCamera(camera2, this.config.camera2)}
        </div>
      </ha-card>
    `;
  }

  _renderCamera(camera, entityId) {
    if (!camera) {
      return html`
        <div class="camera-container">
          <div class="camera-error">Camera entity ${entityId} not found</div>
        </div>
      `;
    }

    return html`
      <div class="camera-container">
        <img
          class="camera-feed"
          src="${this._getCameraUrl(entityId)}"
          @click=${() => this._handleCameraClick(entityId)}
          alt="${camera.attributes.friendly_name || entityId}"
        />
      </div>
    `;
  }

  _getCameraUrl(entityId) {
    return `/api/camera_proxy/${entityId}?token=${this._getToken(entityId)}`;
  }

  _getToken(entityId) {
    const entity = this.hass.states[entityId];
    if (!entity || !entity.attributes.access_token) {
      return "";
    }
    return entity.attributes.access_token;
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
  description: "A card that displays two camera feeds side by side",
});
