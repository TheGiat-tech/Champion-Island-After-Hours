import { FLAGS, SCROLL_IDS } from '../data/constants.js';
import ParticleSystem from '../systems/ParticleSystem.js';

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super('BattleScene');
    this.state = {
      playerHp: 22,
      enemyHp: 20,
    };
    this.log = [];
    this.buttons = [];
    this.particleSystem = null;
  }

  create() {
    this.particleSystem = new ParticleSystem(this);
    this._ensureParticleTexture();
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x1a1024, 1).setOrigin(0);
    this.add.text(width / 2, 24, 'Deadline Phantom', { fontSize: '16px', color: '#f0e6ff' }).setOrigin(0.5);

    this.playerHpText = this.add.text(20, height - 80, '', { fontSize: '14px', color: '#cbe6ff' });
    this.enemyHpText = this.add.text(width - 140, 40, '', { fontSize: '14px', color: '#ffc7de' });

    this.logText = this.add.text(20, height / 2, '', { fontSize: '12px', color: '#e1dbff', wordWrap: { width: width - 40 } });

    this._createButtons();
    this._updateTexts();
    this._log('The phantom looms, fed by unfinished tasks.');
  }

  _ensureParticleTexture() {
    if (!this.textures.exists('particle')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture('particle', 8, 8);
    }
  }

  _createButtons() {
    const actions = [
      { id: 'focus', label: 'Focus (damage)', x: 40, y: 260 },
      { id: 'rest', label: 'Rest (heal)', x: 40, y: 300 },
    ];
    actions.forEach((a) => {
      const rect = this.add.rectangle(a.x, a.y, 180, 32, 0x2b1b34, 0.8).setOrigin(0);
      rect.setStrokeStyle(2, 0x6dc2ff, 0.6);
      const text = this.add.text(a.x + 10, a.y + 8, a.label, { fontSize: '12px', color: '#dfe9ff' });
      rect.setInteractive({ useHandCursor: true }).on('pointerdown', () => this._handleAction(a.id));
      this.buttons.push(rect);
    });

    this.input.keyboard.on('keydown-SPACE', () => this._handleAction('focus'));
    this.input.keyboard.on('keydown-E', () => this._handleAction('rest'));
  }

  _handleAction(id) {
    if (this.state.enemyHp <= 0 || this.state.playerHp <= 0) return;

    if (id === 'focus') {
      const dmg = Phaser.Math.Between(4, 7);
      this.state.enemyHp = Math.max(0, this.state.enemyHp - dmg);
      this._log(`You focus and cut through noise. Phantom loses ${dmg}.`);
      this.particleSystem.burst(240, 80, 0x6dc2ff);
    }
    if (id === 'rest') {
      const heal = Phaser.Math.Between(3, 6);
      this.state.playerHp = Math.min(22, this.state.playerHp + heal);
      this._log(`You take a measured breath. You heal ${heal}.`);
    }

    this._updateTexts();

    if (this.state.enemyHp <= 0) {
      this._win();
      return;
    }

    this.time.delayedCall(400, () => this._enemyTurn());
  }

  _enemyTurn() {
    const dmg = Phaser.Math.Between(3, 6);
    this.state.playerHp = Math.max(0, this.state.playerHp - dmg);
    this._log(`Phantom lashes with urgency. You take ${dmg}.`);
    this._updateTexts();
    if (this.state.playerHp <= 0) {
      this._lose();
    }
  }

  _updateTexts() {
    this.playerHpText.setText(`You: ${this.state.playerHp}/22`);
    this.enemyHpText.setText(`Phantom: ${this.state.enemyHp}/20`);
    this.logText.setText(this.log.slice(-4).join('\n'));
  }

  _log(text) {
    this.log.push(text);
    this.logText.setText(this.log.slice(-4).join('\n'));
  }

  _win() {
    this._log('The phantom exhales and dissolves.');
    this.game.saveSystem.addScroll(SCROLL_IDS[5]);
    this.game.saveSystem.setFlag(FLAGS.PHANTOM_DEFEATED, true);
    this.time.delayedCall(600, () => this.scene.start('WorldScene'));
  }

  _lose() {
    this._log('You stagger. The phantom waits until you return rested.');
    this.time.delayedCall(800, () => this.scene.start('WorldScene'));
  }
}
