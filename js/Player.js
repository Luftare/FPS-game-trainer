class Player {
  constructor(x, y, z) {
    this.recoilCounter = 0;
    this.speed = 2500;
    this.position = new V3(x, y, z);
    this.velocity = new V3();
    this.height = 200;
    this.jumpVelocity = 1500;
    this.phi = 0;
    this.theta = 0;
    this.thetaRange = Math.PI / 2.1;
    this.rayTarget = undefined;
  }

  update(dt) {
    this.handleInput(dt);
    this.applyPhysics(dt);
    this.applyCollisions(dt);
    this.move(dt);
    this.onRay(dt);
  }
  
  onRay(dt) {
    const ray = this.getRay();
    this.rayTarget = getClosestSphereIntersectingRay(this.position, ray, game.state.targets);
  }
  
  getRay() {
    return (new V3(0, 0, 1)).rotateX(-this.theta).rotateY(-this.phi);
  }

  applyRecoil(dt) {
    this.phi += (Math.random() - 0.5) * 0.01 * game.settings.recoil;
    this.theta += (Math.random() - 0.7) * 0.02 * game.settings.recoil;
  }

  applyPhysics(dt) {
    this.velocity.scaledAdd(dt, game.gravity);
  }

  applyCollisions(dt) {
    if(this.position.y + this.height > 0) {
      this.velocity.setY(0);
      this.position.setY(-this.height);
    }
  }

  move(dt) {
    this.position.scaledAdd(dt, this.velocity);
  }

  jump(dt) {
    if(this.position.y + this.height < 0) return;
    this.position.addY(-1)
    this.velocity.setY(-this.jumpVelocity);
  }

  shoot(dt) {
    const dir = this.getRay();
    game.state.bullets.push(new Bullet(this.position, dir));
    this.recoilCounter = (Math.random() + 1) * 0.5;
    this.applyRecoil();
  }

  handleInput(dt) {
    const vec = new V3();
    if(input.click.left === 1) this.shoot(dt);
    game.zoom = input.click.right? 4 : 1;
    if(input.keys.w) vec.addZ(1);
    if(input.keys.s) vec.addZ(-1);
    if(input.keys.a) vec.addX(-1);
    if(input.keys.d) vec.addX(1);
    if(input.keys[" "] === 1) this.jump();

    vec.normalize().scale(this.speed).rotateY(-this.phi);
    this.velocity.set(vec.x, this.velocity.y, vec.z);
    this.phi -= input.mouseMove.x * game.settings.mouseSensitivity * 0.002;
    this.theta += input.mouseMove.y * game.settings.mouseSensitivity * 0.002;
    this.theta = Math.max(Math.min(this.theta, this.thetaRange), -this.thetaRange);
  }

}
