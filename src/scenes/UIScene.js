import DialogBox from '../ui/DialogBox.js';
import HUD from '../ui/HUD.js';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
    this.dialogBox = null;
    this.hud = null;
  }

  create() {
    this.dialogBox = new DialogBox(this);
    this.hud = new HUD(this);

    this.scene.get('WorldScene').events.on('scroll-updated', (count) => {
      this.hud.updateScroll(count);
    });
    this.scene.get('WorldScene').events.on('hint', (text) => {
      this.hud.setHint(text);
    });

    const world = this.scene.get('WorldScene');
    world.events.on('dialog-start', (line) => this.dialogBox.show(line));
    world.events.on('dialog-update', (line) => this.dialogBox.show(line));
    world.events.on('dialog-end', () => this.dialogBox.hide());

    this.hud.updateScroll(this.game.saveSystem.getScrollCount());
  }
}
