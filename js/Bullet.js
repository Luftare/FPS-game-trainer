class Bullet {
  constructor(pos, dir, speed = 1000000 * Math.pow(game.settings.bulletSpeed, 4)) {
    this.TTL = 100;
    this.position = pos.clone();
    this.velocity = dir.clone().normalize().scale(speed);
    this.r = 5;
    this.color = "#FF0";
    game.renderList.push(this)
  }

  update(dt) {
    this.handleLife(dt);
    this.applyPhysics(dt);
    this.handleCollisions(dt);
    this.move(dt);
  }

  handleLife() {
    this.TTL--;
    if(this.TTL <= 0) this._remove = true;
  }

  applyPhysics(dt) {
    this.velocity.scaledAdd(dt, game.gravity);
  }

  handleCollisions(dt) {
    const a = this.position;
    const b = a.clone().scaledAdd(dt, this.velocity);
    const target = getClosestSegmentIntersectingSphere(a, b, game.state.targets);
    if(target) this.onHit(target);
    if(this.position.y > 0) this._remove = true;
  }

  move(dt) {
    this.position.scaledAdd(dt, this.velocity);
  }

  onHit(target) {
    target.onHit(this);
    this._remove = true;
  }

  drawShadow() {

  }

  draw() {
    if(this._remove) return;
    const { ctx } = game;
    const { x, y, behind, scale } = getProjected(this.position);
    if(behind) return;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(x, y, this.r * Math.pow(scale, 0.5), 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
}
