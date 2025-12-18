import { DIRECTIONS } from '../data/constants.js';

export default class AssetLoader {
  constructor() {
    this.manifest = null;
    this.heroFrames = [];
    this.npcEntries = [];
    this.tilemapLoaded = false;
    this.tilesetKey = 'world-tileset';
    this.tilemapKey = 'world-map';
    this.createdHeroAnims = new Set();
  }

  async loadManifest() {
    try {
      const res = await fetch('./data/assets.json');
      if (!res.ok) throw new Error('missing manifest');
      this.manifest = await res.json();
    } catch (err) {
      console.warn('Using placeholder assets due to manifest issue', err);
      this.manifest = {};
    }
  }

  queueAssets(scene) {
    if (!this.manifest) return;

    if (this.manifest.hero && this.manifest.hero.basePath) {
      ['idle', 'walk'].forEach((state) => {
        DIRECTIONS.forEach((dir) => {
          const frames = (this.manifest.hero[state] && this.manifest.hero[state][dir]) || [];
          frames.forEach((file, idx) => {
            const key = `hero_${state}_${dir}_${idx}`;
            const path = `${this.manifest.hero.basePath}${file}`;
            scene.load.image(key, path);
            this.heroFrames.push({ key, state, dir });
          });
        });
      });
    }

    if (Array.isArray(this.manifest.npcs)) {
      this.manifest.npcs.forEach((npc) => {
        if (npc.path) {
          scene.load.image(`npc_${npc.id}`, npc.path);
          this.npcEntries.push(npc);
        }
      });
    }

    if (this.manifest.world && this.manifest.world.tilemapPath) {
      scene.load.tilemapTiledJSON(this.tilemapKey, this.manifest.world.tilemapPath);
      if (this.manifest.world.tilesetImagePath) {
        scene.load.image(this.tilesetKey, this.manifest.world.tilesetImagePath);
      }
    }
  }

  finalizeAnimations(scene) {
    // Create hero animations if frames are available
    this.heroFrames.forEach((frame) => {
      const animKey = `hero-${frame.state}-${frame.dir}`;
      if (this.createdHeroAnims.has(animKey)) return;
      const frames = this.heroFrames.filter((f) => f.state === frame.state && f.dir === frame.dir).map((f) => ({ key: f.key }));
      if (frames.length > 0 && scene.textures.exists(frames[0].key)) {
        scene.anims.create({ key: animKey, frames, frameRate: 8, repeat: -1 });
        this.createdHeroAnims.add(animKey);
      }
    });
  }

  hasHeroSprites() {
    return this.heroFrames.some((frame) => frame.state === 'walk');
  }

  getHeroAnimKey(state, dir) {
    const key = `hero-${state}-${dir}`;
    return this.hasHeroSprites() && this.createdHeroAnims.has(key) ? key : null;
  }

  getNpcKey(id) {
    const entry = this.npcEntries.find((n) => n.id === id);
    if (!entry) return null;
    const key = `npc_${entry.id}`;
    return key;
  }

  hasTilemap(scene) {
    const exists = scene.cache.tilemap.exists(this.tilemapKey);
    this.tilemapLoaded = exists;
    return exists;
  }

  getTilemapKey() {
    return this.tilemapKey;
  }

  getTilesetKey() {
    return this.tilesetKey;
  }
}
