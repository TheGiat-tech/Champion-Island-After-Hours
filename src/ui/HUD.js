export default class HUD {
  constructor(scene) {
    this.scene = scene;
    this.scrollText = scene.add.text(10, 10, 'Scrolls: 0/6', { fontSize: '12px', color: '#e7ecff' }).setScrollFactor(0).setDepth(1002);
    this.hintText = scene.add.text(10, 26, 'Move with WASD / arrows', { fontSize: '12px', color: '#9fb3ff' }).setScrollFactor(0).setDepth(1002);
  }

  updateScroll(count) {
    this.scrollText.setText(`Scrolls: ${count}/6`);
  }

  setHint(text) {
    this.hintText.setText(text || '');
  }
}
