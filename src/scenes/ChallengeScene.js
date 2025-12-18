import { SCROLL_IDS, FLAGS } from '../data/constants.js';
import ParticleSystem from '../systems/ParticleSystem.js';

export default class ChallengeScene extends Phaser.Scene {
  constructor() {
    super('ChallengeScene');
    this.successCount = 0;
    this.particleSystem = null;
  }

  create() {
    this.successCount = 0;
    this.particleSystem = new ParticleSystem(this);
    this._ensureParticleTexture();

    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x0e1933, 1).setOrigin(0);
    this.add.text(width / 2, 30, 'Focus Breath', { fontSize: '16px', color: '#e7ecff' }).setOrigin(0.5);

    this.zone = this.add.rectangle(width / 2, height / 2, width * 0.25, 30, 0x6dc2ff, 0.3).setStrokeStyle(2, 0x6dc2ff);
    this.marker = this.add.rectangle(width * 0.25, height / 2, 8, 32, 0xffc2c7);

    this.speed = 160;
    this.direction = 1;

    this.input.keyboard.on('keydown-SPACE', () => this._attempt());
    this.input.keyboard.on('keydown-E', () => this._attempt());

    this.add.text(width / 2, height - 40, 'Stop the marker in the glowing zone 5 times', { fontSize: '12px', color: '#cdd7ff' }).setOrigin(0.5);

    this.input.addPointer(1);
    this.input.on('pointerdown', () => this._attempt());
  }

  _ensureParticleTexture() {
    if (!this.textures.exists('particle')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture('particle', 8, 8);
    }
  }

  update(_, delta) {
    const dt = delta / 1000;
    this.marker.x += this.direction * this.speed * dt;
    if (this.marker.x < this.zone.x - this.zone.width / 2) {
      this.marker.x = this.zone.x - this.zone.width / 2;
      this.direction = 1;
    }
    if (this.marker.x > this.zone.x + this.zone.width / 2) {
      this.marker.x = this.zone.x + this.zone.width / 2;
      this.direction = -1;
    }
  }

  _attempt() {
    const inside = Phaser.Geom.Rectangle.Overlaps(this.zone.getBounds(), this.marker.getBounds());
    if (inside) {
      this.successCount += 1;
      this.particleSystem.burst(this.marker.x, this.marker.y, 0x6dc2ff);
      if (this.successCount >= 5) {
        this._complete();
      }
    } else {
      this.successCount = Math.max(0, this.successCount - 1);
      this.tweens.add({ targets: this.marker, x: this.marker.x + (Math.random() > 0.5 ? 10 : -10), yoyo: true, duration: 80 });
    }
  }

  _complete() {
    this.game.saveSystem.addScroll(SCROLL_IDS[4]);
    this.game.saveSystem.setFlag(FLAGS.CHALLENGE_COMPLETED, true);
    this.scene.start('WorldScene');
  }
}
