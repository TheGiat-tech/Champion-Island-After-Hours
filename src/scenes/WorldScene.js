import { CAMERA_ZOOM, COLORS, DAY_NIGHT, WORLD_BOUNDS } from '../config.js';
import { FLAGS, NPC_IDS, SCROLL_IDS } from '../data/constants.js';
import InputSystem from '../systems/InputSystem.js';
import DialogSystem from '../systems/DialogSystem.js';
import ParticleSystem from '../systems/ParticleSystem.js';
import CollisionSystem from '../systems/CollisionSystem.js';

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
    this.player = null;
    this.inputSystem = null;
    this.dialogSystem = null;
    this.particleSystem = null;
    this.collisionSystem = null;
    this.npcs = [];
    this.scrolls = [];
    this.gate = null;
    this.gateUnlocked = false;
    this.lastHint = '';
  }

  create() {
    this._ensureParticleTexture();
    this._createWorld();

    this.inputSystem = new InputSystem(this);
    this.dialogSystem = new DialogSystem(this);
    this.particleSystem = new ParticleSystem(this);

    const savedPos = this.game.saveSystem.getPlayerPosition();
    this._createPlayer(savedPos.x, savedPos.y);
    this._createNPCs();
    this._createScrolls();
    this._createGate();

    this.collisionSystem = new CollisionSystem(this, this.gate);
    if (this.gate) {
      this.collisionSystem.enableGateCollision(this.player, this.gate);
    }
    if (this.worldLayer) {
      this.physics.add.collider(this.player, this.worldLayer);
      this.npcs.forEach((npc) => this.physics.add.collider(npc, this.worldLayer));
    }

    this._setupCamera();
    this._setupDayNightOverlay();

    this.events.emit('scroll-updated', this.game.saveSystem.getScrollCount());
    this.events.emit('hint', 'Explore the island. Interact with E or the touch button.');

    this.events.on('dialog-start', () => this.events.emit('hint', 'Press Space / Confirm to continue'));
    this.events.on('dialog-end', () => this.events.emit('hint', ''));
  }

  _ensureParticleTexture() {
    if (!this.textures.exists('particle')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture('particle', 8, 8);
    }
  }

  _createWorld() {
    const loader = this.game.assetLoader;
    const hasMap = loader.hasTilemap(this);
    if (hasMap) {
      const map = this.make.tilemap({ key: loader.getTilemapKey() });
      const tileset = map.addTilesetImage(loader.manifest?.world?.tilesetName || 'tileset', loader.getTilesetKey());
      const layer = map.createLayer(0, tileset, 0, 0);
      layer.setCollisionByExclusion([-1]);
      this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
      this.worldLayer = layer;
      this.worldSize = { width: map.widthInPixels, height: map.heightInPixels };
    } else {
      const { width, height } = WORLD_BOUNDS;
      const tile = 64;
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(COLORS.background, 1);
      graphics.fillRect(0, 0, width, height);
      graphics.lineStyle(1, 0x1d243d, 0.4);
      for (let x = 0; x < width; x += tile) {
        graphics.lineBetween(x, 0, x, height);
      }
      for (let y = 0; y < height; y += tile) {
        graphics.lineBetween(0, y, width, y);
      }
      graphics.generateTexture('procedural-world', width, height);
      this.add.image(0, 0, 'procedural-world').setOrigin(0);
      this.worldSize = { width, height };
      this.physics.world.setBounds(0, 0, width, height);
    }
  }

  _createPlayer(x, y) {
    const hasHero = this.game.assetLoader.hasHeroSprites();
    if (hasHero) {
      this.player = this.physics.add.sprite(x, y, this.game.assetLoader.heroFrames[0]?.key || null);
    } else {
      const size = 16;
      const g = this.add.rectangle(0, 0, size, size * 1.2, COLORS.hero).setOrigin(0.5);
      this.physics.add.existing(g);
      this.player = g;
      this._fakeWalkTween = this.tweens.add({ targets: g, scaleY: 0.95, scaleX: 1.05, duration: 200, yoyo: true, repeat: -1, paused: true });
    }
    this.player.body.setCollideWorldBounds(true);
  }

  _createNPCs() {
    const positions = [
      { id: NPC_IDS.SAGE, x: 240, y: 200 },
      { id: NPC_IDS.ARCHIVIST, x: 520, y: 320 },
      { id: NPC_IDS.GROUNDSKEEPER, x: 900, y: 260 },
    ];
    positions.forEach((p) => {
      const key = this.game.assetLoader.getNpcKey(p.id);
      let npc;
      if (key && this.textures.exists(key)) {
        npc = this.physics.add.sprite(p.x, p.y, key);
      } else {
        npc = this.add.rectangle(p.x, p.y, 18, 22, COLORS[p.id] || 0xffffff);
        this.physics.add.existing(npc);
      }
      npc.body.setImmovable(true);
      npc.setData('id', p.id);
      this.npcs.push(npc);
      this.physics.add.collider(this.player, npc);
    });
  }

  _createScrolls() {
    const positions = [
      { id: SCROLL_IDS[0], x: 180, y: 120 },
      { id: SCROLL_IDS[1], x: 360, y: 160 },
      { id: SCROLL_IDS[2], x: 600, y: 200 },
      { id: SCROLL_IDS[3], x: 820, y: 320 },
    ];

    positions.forEach((p, idx) => {
      if (this.game.saveSystem.hasScroll(p.id)) return;
      const scroll = this.add.circle(p.x, p.y, 8, COLORS.scroll).setStrokeStyle(2, 0xffe89a);
      this.physics.add.existing(scroll, true);
      this.tweens.add({ targets: scroll, y: p.y - 6, duration: 800, yoyo: true, repeat: -1, ease: 'sine.inout' });
      this.scrolls.push({ id: p.id, node: scroll });
    });
  }

  _createGate() {
    const unlocked = this.game.saveSystem.getFlag(FLAGS.BRIDGE_UNLOCKED) || this.game.saveSystem.getScrollCount() >= 2;
    const gateX = 700;
    const gateY = 240;
    const gate = this.add.rectangle(gateX, gateY, 40, 40, COLORS.gate, unlocked ? 0.2 : 1);
    this.physics.add.existing(gate, true);
    this.gate = gate;
    if (unlocked) {
      this._unlockGate();
    }
  }

  _setupCamera() {
    this.cameras.main.setZoom(CAMERA_ZOOM);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setBounds(0, 0, this.worldSize.width, this.worldSize.height);
  }

  _setupDayNightOverlay() {
    const { width, height } = this.scale;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000011, 0.15);
    overlay.setScrollFactor(0);
    overlay.setDepth(1001);
    this.dayOverlay = overlay;
  }

  update(time, delta) {
    if (!this.player || !this.inputSystem) return;
    const dt = delta / 1000;

    this.inputSystem.update();

    if (this.dialogSystem.active) {
      if (this.inputSystem.confirmPressed) this.dialogSystem.advance();
      return;
    }

    this._updateMovement(dt);
    this._checkInteractions();
    this._updateDayNight(time);
  }

  _updateMovement(dt) {
    const body = this.player.body;
    const accel = 420;
    const friction = 6;
    const maxSpeed = 160;
    body.velocity.x += this.inputSystem.direction.x * accel * dt;
    body.velocity.y += this.inputSystem.direction.y * accel * dt;

    body.velocity.x -= body.velocity.x * friction * dt;
    body.velocity.y -= body.velocity.y * friction * dt;

    body.velocity.limit(maxSpeed);

    const speed = body.velocity.length();
    if (speed > 5) {
      if (this._fakeWalkTween) this._fakeWalkTween.resume();
      this.player.setScale(1 + Math.sin(this.time.now / 120) * 0.05, 1 - Math.sin(this.time.now / 160) * 0.05);
    } else {
      if (this._fakeWalkTween) this._fakeWalkTween.pause();
      this.player.setScale(1, 1);
    }
  }

  _checkInteractions() {
    const interactRange = 48;
    let hint = '';

    // Scroll pickup
    this.scrolls.forEach((s) => {
      if (!s.node.active) return;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, s.node.x, s.node.y);
      if (dist < interactRange) {
        hint = 'Collect the glowing scroll';
        if (this.inputSystem.interactPressed) {
          this._pickupScroll(s);
        }
      }
    });

    // NPCs
    let focusedNpc = null;
    this.npcs.forEach((npc) => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
      if (dist < interactRange) {
        focusedNpc = npc;
      }
    });

    if (focusedNpc) {
      hint = `Talk to ${focusedNpc.getData('id')}`;
      if (this.inputSystem.interactPressed) {
        this._talkToNpc(focusedNpc.getData('id'));
      }
    }

    // Gate
    if (!this.gateUnlocked) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.gate.x, this.gate.y);
      if (dist < interactRange) {
        hint = 'A bridge sealed by imbalance';
        if (this.game.saveSystem.getScrollCount() >= 2) {
          this._unlockGate();
          this.game.saveSystem.setFlag(FLAGS.BRIDGE_UNLOCKED, true);
        }
      }
    }

    if (hint !== this.lastHint) {
      this.events.emit('hint', hint);
      this.lastHint = hint;
    }
  }

  _talkToNpc(id) {
    const script = this.dialogSystem.getNpcScript(id, this.game.saveSystem);
    const onComplete = () => {
      if (id === NPC_IDS.SAGE && !this.game.saveSystem.getFlag(FLAGS.CHALLENGE_COMPLETED)) {
        this._startChallenge();
      }
      if (id === NPC_IDS.GROUNDSKEEPER && this.game.saveSystem.getScrollCount() >= 3 && !this.game.saveSystem.getFlag(FLAGS.PHANTOM_DEFEATED)) {
        this._startBattle();
      }
    };
    this.dialogSystem.open(script, onComplete);
  }

  _pickupScroll(scroll) {
    scroll.node.destroy();
    this.game.saveSystem.addScroll(scroll.id);
    this.particleSystem.burst(scroll.node.x, scroll.node.y, COLORS.scroll);
    this.events.emit('scroll-updated', this.game.saveSystem.getScrollCount());
    if (this.game.saveSystem.getScrollCount() >= 2 && !this.gateUnlocked) {
      this._unlockGate();
      this.game.saveSystem.setFlag(FLAGS.BRIDGE_UNLOCKED, true);
    }
  }

  _unlockGate() {
    this.gateUnlocked = true;
    if (this.collisionSystem) this.collisionSystem.disableGate();
    if (this.gate) this.gate.setAlpha(0.15);
  }

  _updateDayNight(time) {
    const cycle = Math.sin((time % DAY_NIGHT.durationMs) / DAY_NIGHT.durationMs * Math.PI * 2);
    const alpha = 0.1 + (cycle + 1) / 2 * DAY_NIGHT.amplitude;
    this.dayOverlay.setAlpha(alpha);
  }

  _startChallenge() {
    this.game.saveSystem.setPlayerPosition(this.player.x, this.player.y);
    this.scene.start('ChallengeScene');
  }

  _startBattle() {
    this.game.saveSystem.setPlayerPosition(this.player.x, this.player.y);
    this.scene.start('BattleScene');
  }
}
