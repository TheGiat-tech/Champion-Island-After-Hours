export default class CollisionSystem {
  constructor(scene, gateArea) {
    this.scene = scene;
    this.gateArea = gateArea;
    this.gateCollider = null;
  }

  enableGateCollision(player, gateObject) {
    this.gateCollider = this.scene.physics.add.collider(player, gateObject);
  }

  disableGate() {
    if (this.gateCollider) {
      this.gateCollider.destroy();
      this.gateCollider = null;
    }
    if (this.gateArea) {
      this.gateArea.disableBody(true, true);
    }
  }
}
