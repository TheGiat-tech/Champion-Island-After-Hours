import BootScene from './scenes/BootScene.js';
import WorldScene from './scenes/WorldScene.js';
import ChallengeScene from './scenes/ChallengeScene.js';
import BattleScene from './scenes/BattleScene.js';
import UIScene from './scenes/UIScene.js';
import { GAME_WIDTH, GAME_HEIGHT, PHYSICS_SETTINGS } from './config.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0f1327',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: PHYSICS_SETTINGS,
  scene: [BootScene, WorldScene, ChallengeScene, BattleScene, UIScene],
};

new Phaser.Game(config);
