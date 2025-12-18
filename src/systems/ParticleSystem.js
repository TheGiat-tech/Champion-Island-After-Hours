export default class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
  }

  burst(x, y, color = 0xffffff) {
    const particles = this.scene.add.particles(0, 0, 'particle', {
      speed: { min: 30, max: 120 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 12,
      tint: color,
    });
    particles.setDepth(10);
    particles.emitParticleAt(x, y, 12);
    this.scene.time.delayedCall(600, () => particles.destroy());
  }
}
