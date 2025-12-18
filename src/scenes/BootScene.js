import AssetLoader from '../systems/AssetLoader.js';
import SaveSystem from '../systems/SaveSystem.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  init() {
    this.game.assetLoader = new AssetLoader();
    this.game.saveSystem = new SaveSystem(this);
  }

  preload() {
    const { width, height } = this.cameras.main;
    const barWidth = width * 0.6;
    const barHeight = 12;
    const progressBg = this.add.rectangle(width / 2, height / 2, barWidth, barHeight, 0x222840);
    const progressFg = this.add.rectangle(width / 2 - barWidth / 2, height / 2, 0, barHeight, 0x6dc2ff).setOrigin(0, 0.5);
    this.add.text(width / 2, height / 2 - 30, 'Waking the island...', { fontSize: '14px', color: '#cdd7ff' }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      progressFg.width = barWidth * value;
    });

    this.game.assetLoader.loadManifest().finally(() => {
      this.game.assetLoader.queueAssets(this);
      this.load.start();
    });
  }

  create() {
    this.game.assetLoader.finalizeAnimations(this);
    this.game.saveSystem.load();
    this.scene.start('WorldScene');
    this.scene.launch('UIScene');
  }
}
