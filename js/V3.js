class V3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  get length() {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }

  get angleZ() {
    return (this.x < 0? Math.PI : 0) + Math.atan(this.y / this.x);
  }

  random(s = 1) {
    this.x = (1 - 2 * Math.random()) * s;
    this.y = (1 - 2 * Math.random()) * s;
    this.z = (1 - 2 * Math.random()) * s;
    return this;
  }

  randomXY(s = 1) {
    this.x = (1 - 2 * Math.random()) * s;
    this.y = (1 - 2 * Math.random()) * s;
    return this;
  }

  toString() {
    return `(${this.x}, ${this.y}, ${this.z})`;
  }

  fromVector(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  fromAngles(theta, phi, l = 1) {
    return this.set(
      Math.sin(theta) * Math.cos(phi) * l,
      Math.sin(theta) * Math.sin(phi) * l,
      Math.cos(theta) * l,
    );
  }

  cross(v) {
    return new V3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  setLength(l) {
    return this.normalize().scale(l);
  }

  withinDistanceXY(v, dist) {
    return this.sqDistanceXY(v) <= dist ** 2;
  }

  withinDistance(v, dist) {
    return this.sqDistance(v) <= dist ** 2;
  }

  sqDistanceXY(v) {
    return (v.x - this.x) ** 2 + (v.y - this.y) ** 2;
  }

  distanceXY(v) {
    return Math.sqrt(this.sqDistanceXY(v));
  }

  sqDistsanceXZ(v) {
    return (v.x - this.x) ** 2 + (v.z - this.z) ** 2;
  }

  distanceXZ(v) {
    return Math.sqrt(this.sqDistsanceXZ(v));
  }

  sqDistance(v) {
    return (this.x - v.x) ** 2 + (this.y - v.y) ** 2 + (this.z - v.z) ** 2;
  }

  distance(v) {
    return Math.sqrt(this.sqDistance(v));
  }

  clampByVector(v) {
    this.x = Math.min(v.x, this.x);
    this.y = Math.min(v.y, this.y);
    this.z = Math.min(v.z, this.z);
    return this;
  }

  clampByZero() {
    this.x = Math.max(this.x, 0);
    this.y = Math.max(this.y, 0);
    this.z = Math.max(this.z, 0);
    return this;
  }

  stretch(l) {
    return this.setLength(this.length + l);
  }

  limit(l) {
    return this.length > l? this.setLength(l) : this;
  }

  set(x, y, z) {
    if(x instanceof V3) return this.fromVector(x);
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  setX(x) {
    this.x = x;
    return this;
  }

  setY(y) {
    this.y = y;
    return this;
  }

  setZ(z) {
    this.z = z;
    return this;
  }

  addX(n) {
    this.x += n;
    return this;
  }

  addY(n) {
    this.y += n;
    return this;
  }

  addZ(n) {
    this.z += n;
    return this;
  }

  add(...vecs) {
    vecs.forEach(v => {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
    })
    return this;
  }

  scale(s) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  clone() {
    return new V3(this.x, this.y, this.z);
  }

  substract(...vecs) {
    vecs.forEach(v => {
      this.x -= v.x;
      this.y -= v.y;
      this.z -= v.z;
    })
    return this;
  }

  scaledAdd(s, ...vecs) {
    vecs.forEach(v => {
      this.x += v.x * s;
      this.y += v.y * s;
      this.z += v.z * s;
    });
    return this;
  }

  normalize() {
    const len = this.length;
    if(len === 0) return this;
    return this.scale(1 / len);
  }

  rotateX(a) {
    const v = this.clone();
    return this.set(
      v.x,
      v.y * Math.cos(a) - v.z * Math.sin(a),
      v.y * Math.sin(a) + v.z * Math.cos(a)
    );
  }

  rotateY(a) {
    const v = this.clone();
    return this.set(
      v.x * Math.cos(a) + v.z * Math.sin(a),
      v.y,
      -v.x * Math.sin(a) + v.z * Math.cos(a)
    );
  }

  rotateZ(a) {
    const v = this.clone();
    return this.set(
      v.x * Math.cos(a) - v.y * Math.sin(a),
      v.x * Math.sin(a) + v.y * Math.cos(a),
      v.z
    );
  }

  rotateAboutPointZ(p, a) {
    return this.substract(p).rotateZ(a).add(p);
  }

  zero() {
    return this.set(0, 0, 0);
  }
}
