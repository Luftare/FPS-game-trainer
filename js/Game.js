class Game {
  constructor(settings) {
    this.initView();
    this.state = {};
    this.loop = new Loop({
      animationFrame: true,
      onTick: dt => {
        this.update(Math.min(0.2, dt / 1000));
        this.render();
      }
    });
    this.gravity = new V3(0, 2000, 0);
    this.zoom = 1;
    this.spawnTimeoutId = 0;
    this.settings = Object.assign({}, {
      name: "",
      mouseSensitivity: 0.5,
      recoil: 0,
      bulletSpeed: 1,
      FOV: 60,
    }, settings);
    this.style = {
      fogColor: "#99D",
      groundColor: "#862"
    };
  }

  getInitState() {
    const startTime = Date.now();
    const time = 0;
    const player = new Player(0, -200, -4000);
    const targets = (new Array(100)).fill(1).map(e => {
      const r = 50 + Math.random() * 100;
      const position = (new V3(0, r, Math.random() * 50000)).rotateY(Math.random() * Math.PI * 2);
      const velocity = new V3(0, -Math.random() * 5000, 0);
      const color = "#222"
      return new Target({ position, velocity, r, color });
    });
    targets.push(new FollowTarget({}));
    const bullets = [];
    const life = 100;
    const over = false;
    const score = 0;
    return {
      player, targets, bullets, life, over, startTime, time, score
    };
  }

  initView() {
    this.canvas = document.getElementById("screen");
    this.ctx = this.canvas.getContext("2d");
    this.renderList = [];

    const fillScreen = e => {
      this.canvas.width = innerWidth;
      this.canvas.height = innerHeight;
    };
    window.onresize = fillScreen;
    fillScreen();
  }

  update(dt) {
    this.state.player.update(dt);
    this.state.bullets.forEach(b => b.update(dt));
    this.state.targets.forEach(t => t.update(dt));

    this.state.bullets = this.state.bullets.filter(b => !b._remove);
    this.state.targets = this.state.targets.filter(t => !t._remove);
    this.renderList = this.renderList.filter(e => !e._remove);
  
    this.updateLife(dt);
    this.updateState(dt);
    input.update(dt);
  }
  
  updateLife(dt) {
    const flickTargets = this.state.targets.filter(t => t instanceof FlickTarget);
    const followTarget = this.state.targets.find(t => t instanceof FollowTarget);
    this.state.life += 
      (this.state.player.rayTarget === followTarget? 6 : 0 ) * dt 
      - flickTargets.length * dt * 10
      - 5 * dt;
    this.life = Math.max(0, Math.min(100, this.life));
  }
  
  updateState(dt) {
    this.state.time = Date.now() - this.state.startTime;
    if(this.state.life <= 0 && !this.state.ended) this.onGameover();
  }

  render() {
    const { ctx, canvas } = this;
    this.canvas.width = this.canvas.width;
    ctx.save()
    ctx.setTransform(
      this.zoom, 0, 0, this.zoom, -(this.zoom - 1) * canvas.width / 2,
      -(this.zoom - 1) * canvas.height / 2
    );
    this.drawSky(ctx);
    this.drawGround(ctx);
    this.renderList.sort((a, b) => b.position.sqDistance(this.state.player.position) - a.position.sqDistance(this.state.player.position))
    this.renderList.forEach(e => e.drawShadow(ctx))
    this.renderList.forEach(e => e.draw(ctx));
    ctx.restore();
    ctx.fillStyle = "black";
    this.drawGUI(ctx);
    
  }
  
  drawSky(ctx) {
    ctx.fillStyle = this.style.fogColor;
    ctx.fillRect(0, 0, innerWidth, innerHeight);
  }
  
  drawGround(ctx) {
    const proj = getProjected((new V3(0, 0, 1700)).rotateY(-this.state.player.phi).add(this.state.player.position));
    const x = 0;
    const y = proj.y;
    const h = innerHeight;
    const w = innerWidth;
    const grd = ctx.createLinearGradient(0, y, 0, h + y);
    grd.addColorStop(0, this.style.fogColor);
    grd.addColorStop(Math.min(1, -this.state.player.position.y / 5000), this.getFoggedColor(this.style.groundColor, -this.state.player.position.y * 1.5));
    ctx.fillStyle = grd;
    ctx.fillRect(x, y, w, h - y);
  }
  
  getFoggedColor(hex, dist) {
    return mixColors(hex, this.style.fogColor, Math.pow(dist, 0.9) / 10000);
  }

  drawGUI() {
    const ctx = this.ctx;
    const width = this.zoom === 1? 20 : innerWidth;
    const thickness = 1;
    ctx.fillRect(innerWidth / 2 - width / 2, innerHeight / 2 - thickness / 2, width, thickness);
    ctx.fillRect(innerWidth / 2 - thickness / 2, innerHeight / 2 - width / 2, thickness, width);
    if(this.zoom > 1) {
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.arc(innerWidth / 2, innerHeight / 2, innerWidth / 2, 0, Math.PI * 2);
      ctx.lineWidth = innerWidth / 2;
      ctx.closePath();
      ctx.stroke();
    }
  }

  spawnTarget() {
    const followTarget = this.state.targets.find(t => t instanceof FollowTarget);
    const xSign = Math.random() > 0.5? 1 : -1;
    const position = (new V3(0, -Math.random() * 500 - followTarget.r * 2, 0)).rotateZ(Math.random() * Math.PI / 4).add(followTarget.position);
    const velocity = (new V3(0, -Math.random() * 2000, 0)).rotateZ(Math.random() * Math.PI * 2).rotateY(Math.random() * Math.PI * 2);
    this.state.targets.push(new FlickTarget({ position, velocity }));
    this.spawnTimeoutId = setTimeout(() => {
      if(this.state.ended) return;
      this.spawnTarget();
    }, 1000 * Math.random() + 3000)
  }
  
  onGameover() {
    this.state.ended = true;
    clearTimeout(this.spawnTimeoutId);
    this.state.targets.filter(t => t instanceof FlickTarget).forEach(t => t._remove = true);
    this.state.player.position.addY(-5);
    this.state.player.velocity.setY(-5000);
    app.saveScore();
  }
  
  end() {
    clearTimeout(this.spawnTimeoutId);
    this.loop.stop();
  }
  
  start() {
    this.state = this.getInitState();
    this.loop.start();
    this.spawnTimeoutId = setTimeout(() => {
      this.spawnTarget();
    }, 2000);
  }
}
