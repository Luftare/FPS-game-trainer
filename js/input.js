const input = {
  keys: {},
  click : {
    right: 0,
    left: 0
  },
  mouseMove: {
    x: 0,
    y: 0
  },
  lastMouseMove: [0, 0],
  update(dt) {
    this.mouseMove.x = this.mouseMove.y = 0;
    if(this.click.right) this.click.right = 2;
    if(this.click.left) this.click.left = 2;
    for(key in this.keys) {
      this.keys[key] = 2;
    }
  },
  setupEventListeners() {
    document.getElementById("screen").addEventListener("mousedown", e => {
      if(e.button === 0) input.click.left = 1;
      if(e.button === 2) input.click.right = 1;
    });

    document.getElementById("screen").addEventListener("mouseup", e => {
      if(e.button === 0) input.click.left = 0;
      if(e.button === 2) input.click.right = 0;
    });

    document.addEventListener("keydown", e => {
      input.keys[e.key] = 1;
    });

    document.addEventListener("keyup", e => {
      delete input.keys[e.key];
    });

    document.getElementById("screen").addEventListener("mousemove", e => {
      const accX = e.movementX - this.lastMouseMove[0];
      const accY = e.movementY - this.lastMouseMove[1];
      if(Math.abs(accX) > 300 || Math.abs(accY) > 200) return;
      this.lastMouseMove = [e.movementX, e.movementY];
      input.mouseMove.x += e.movementX;
      input.mouseMove.y += e.movementY;
    });

    document.getElementById("screen").addEventListener("mousedown", e => {
      e.target.requestPointerLock();
    });
  }
};


