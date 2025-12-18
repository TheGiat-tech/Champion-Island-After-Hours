import { STORAGE_KEY } from '../data/constants.js';
import { SAVE_VERSION } from '../config.js';

export default class SaveSystem {
  constructor(scene) {
    this.scene = scene;
    this.data = this._defaultData();
  }

  _defaultData() {
    return {
      version: SAVE_VERSION,
      player: { x: 160, y: 180 },
      scrolls: [],
      flags: {},
      inventory: [],
    };
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.version !== SAVE_VERSION) {
        console.info('Save version mismatch, resetting');
        return;
      }
      this.data = { ...this._defaultData(), ...parsed };
    } catch (err) {
      console.warn('Failed to load save, using defaults', err);
      this.data = this._defaultData();
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (err) {
      console.warn('Save failed', err);
    }
  }

  setPlayerPosition(x, y) {
    this.data.player = { x, y };
    this.save();
  }

  getPlayerPosition() {
    return this.data.player || { x: 160, y: 180 };
  }

  hasScroll(id) {
    return this.data.scrolls.includes(id);
  }

  addScroll(id) {
    if (!this.data.scrolls.includes(id)) {
      this.data.scrolls.push(id);
      this.save();
    }
  }

  getScrollCount() {
    return this.data.scrolls.length;
  }

  setFlag(name, value) {
    this.data.flags[name] = value;
    this.save();
  }

  getFlag(name) {
    return !!this.data.flags[name];
  }

  clear() {
    this.data = this._defaultData();
    this.save();
  }
}
