export default class InputSystem {
  constructor(scene) {
    this.scene = scene;
    this.cursor = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      confirm: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    this.direction = new Phaser.Math.Vector2();
    this.interactPressed = false;
    this.confirmPressed = false;

    this.touchState = {
      up: false,
      down: false,
      left: false,
      right: false,
      interact: false,
      confirm: false,
    };

    this._createTouchControls();
  }

  _createTouchControls() {
    const { width, height } = this.scene.scale;
    const padSize = Math.min(width, height) * 0.18;
    const btnSize = padSize * 0.5;
    const baseX = padSize * 0.8;
    const baseY = height - padSize * 0.8;

    const graphics = this.scene.add.graphics({ x: 0, y: 0, scrollFactor: 0 });
    graphics.setDepth(1000);

    const drawButton = (x, y, label) => {
      graphics.lineStyle(2, 0xffffff, 0.4);
      graphics.fillStyle(0xffffff, 0.12);
      graphics.strokeCircle(x, y, btnSize);
      graphics.fillCircle(x, y, btnSize * 0.9);
      const text = this.scene.add.text(x, y, label, { fontSize: `${btnSize * 0.5}px`, color: '#ffffff' }).setOrigin(0.5).setDepth(1001).setScrollFactor(0);
      return { x, y, radius: btnSize, text };
    };

    this.touchButtons = {
      up: drawButton(baseX, baseY - btnSize, ''),
      down: drawButton(baseX, baseY + btnSize, ''),
      left: drawButton(baseX - btnSize, baseY, ''),
      right: drawButton(baseX + btnSize, baseY, ''),
      interact: drawButton(width - padSize * 0.6, baseY, 'E'),
      confirm: drawButton(width - padSize * 0.2, baseY - btnSize * 0.4, '•'),
    };

    const zone = this.scene.add.zone(0, 0, width, height).setOrigin(0).setInteractive();
    zone.setScrollFactor(0);
    zone.on('pointerdown', (pointer) => this._updateTouch(pointer, true));
    zone.on('pointerup', (pointer) => this._updateTouch(pointer, false));
    zone.on('pointermove', (pointer) => this._updateTouch(pointer, pointer.isDown));
    this.zone = zone;
  }

  _updateTouch(pointer, isDown) {
    const { x, y } = pointer;
    Object.keys(this.touchButtons).forEach((key) => {
      const btn = this.touchButtons[key];
      const dist = Phaser.Math.Distance.Between(x, y, btn.x, btn.y);
      this.touchState[key] = isDown && dist <= btn.radius;
    });
  }

  update() {
    this.direction.set(0, 0);
    const keyboardHorizontal = (this.cursor.left.isDown || this.wasd.left.isDown ? -1 : 0) + (this.cursor.right.isDown || this.wasd.right.isDown ? 1 : 0);
    const keyboardVertical = (this.cursor.up.isDown || this.wasd.up.isDown ? -1 : 0) + (this.cursor.down.isDown || this.wasd.down.isDown ? 1 : 0);

    const touchHorizontal = (this.touchState.left ? -1 : 0) + (this.touchState.right ? 1 : 0);
    const touchVertical = (this.touchState.up ? -1 : 0) + (this.touchState.down ? 1 : 0);

    this.direction.x = keyboardHorizontal || touchHorizontal;
    this.direction.y = keyboardVertical || touchVertical;
    if (this.direction.lengthSq() > 1) this.direction.normalize();

    const interactDown = Phaser.Input.Keyboard.JustDown(this.wasd.interact) || this.touchState.interact;
    const confirmDown = Phaser.Input.Keyboard.JustDown(this.wasd.confirm) || this.touchState.confirm;
    const cursorSpace = Phaser.Input.Keyboard.JustDown(this.cursor.space);

    this.interactPressed = interactDown || Phaser.Input.Keyboard.JustDown(this.cursor.shift);
    this.confirmPressed = confirmDown || cursorSpace;
  }
}
