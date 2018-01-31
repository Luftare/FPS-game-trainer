class Target {
  constructor({
    color = "#555",
    position = new V3(0, -200, 0),
    velocity = (new V3(300, -500, 0)).rotateY(Math.random() * Math.PI * 2),
    r = 200,
  }) {
    this.position = position.clone();
    this.velocity = velocity.clone();
    this.r = r;
    this.fade = 0;
    this.color = color;
    game.renderList.push(this);
  }
  
  async remove() {
    while(this.fade < 1) {
      this.fade += 0.1;
      await sleep(8);
    }
    this._remove = true;
  }
  
  onHit() {
    this.remove();
  }

  update(dt) {
    this.applyPhysics(dt);
    this.applyCollisions(dt);
    this.move(dt);
  }

  applyPhysics(dt) {
    this.velocity.scaledAdd(dt, game.gravity);
  }

  applyCollisions(dt) {
    if(this.position.y + this.r > 0) {
      this.velocity.y *= -0.5;
      this.velocity.scale(0.9)
      this.position.setY(-this.r);
    }
  }

  move(dt) {
    this.position.scaledAdd(dt, this.velocity);
  }

  drawShadow() {
    const { ctx } = game;
    const { x, y, z, scale, behind } = getProjected(this.position.clone().setY(0));
    if(behind) return;
    const distXZ = this.position.distanceXZ(game.state.player.position);
    const h = game.state.player.position.y;
    const scaleY = Math.atan(-h / distXZ);
    ctx.fillStyle = game.getFoggedColor("#000", z);
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.ellipse(x, y, this.r * scale, this.r * scale * scaleY, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  draw() {
    const { ctx } = game;
    const { x, y, z, scale, behind } = getProjected(this.position);
    const r = this.r * ((this.fade + 1) * scale);
    const a = Math.max(0, 1 - this.fade);
    const aimed = game.state.player.rayTarget === this;
    if(behind) return;
    
    if(aimed) {
      ctx.globalAlpha = a
      ctx.fillStyle = brightness(this.color, 0.8);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }
 
    ctx.globalAlpha = a
    ctx.fillStyle = game.getFoggedColor(this.color, z);
    ctx.beginPath();
    ctx.arc(x, y, aimed? Math.max(0.001, r - 1) : r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
}

class FollowTarget extends Target {
  constructor(conf) {
    super(Object.assign({}, conf, {
      color: "#0A0",
    }));
    this.moveTarget = this.position.clone();
  }
  
  onHit() {
    
  }
  
  seek(dt) {
    if(this.position.distance(this.moveTarget) < 100) {
      const scale = 1 + game.state.time / 20000;
      this.moveTarget.add((new V3(Math.random() * 5000, 0, 0)).rotateY(Math.random() * Math.PI * 2)).setY(-Math.random() * 1000 - this.r);
      this.velocity = this.moveTarget.clone().substract(this.position).normalize().scale(500 + Math.random() * 200).scale(scale);
    }
  }
  
  update(dt) {
    this.seek(dt);
    this.move(dt);
  }
}

class FlickTarget extends Target {
  constructor(conf) {
    super(Object.assign({}, conf, {
      color: "#F40",
    }));
  }
  
  onHit() {
    super.onHit();
    game.state.score++;
  }
}

