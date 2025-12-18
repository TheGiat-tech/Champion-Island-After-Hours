export default class DialogBox {
  constructor(scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0).setDepth(1002).setScrollFactor(0);
    const { width, height } = scene.scale;
    const boxHeight = height * 0.25;
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x0d0f1a, 0.8);
    graphics.fillRoundedRect(8, height - boxHeight - 8, width - 16, boxHeight, 12);
    graphics.lineStyle(2, 0x6dc2ff, 0.7);
    graphics.strokeRoundedRect(8, height - boxHeight - 8, width - 16, boxHeight, 12);
    this.text = scene.add.text(20, height - boxHeight, '', {
      fontSize: '14px',
      color: '#e7ecff',
      wordWrap: { width: width - 48 },
    });
    this.container.add([graphics, this.text]);
    this.container.setVisible(false);
    this.fullText = '';
    this.charIndex = 0;
    this.timer = null;
  }

  show(line) {
    this.container.setVisible(true);
    this.fullText = line;
    this.charIndex = 0;
    this.text.setText('');
    if (this.timer) this.timer.remove(false);
    this.timer = this.scene.time.addEvent({
      delay: 25,
      repeat: line.length,
      callback: () => {
        this.charIndex += 1;
        this.text.setText(line.slice(0, this.charIndex));
      },
    });
  }

  hide() {
    this.container.setVisible(false);
    if (this.timer) this.timer.remove(false);
  }
}
