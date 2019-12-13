/*jshint esversion: 6 */

class TriangleBuilder {
  constructor(data) {
    this.data = data;
    this.offset = [0, 0, 0];
  }

  addVertex(v, t1, t2, textC) {
    this.data.points.push(v[0]);
    this.data.points.push(v[1]);
    this.data.points.push(v[2]);
    this.data.uv.push(LVecs.rescale(t1, [0, 1], [textC[0], textC[0] + textC[2]]));
    this.data.uv.push(LVecs.rescale(t2, [0, 1], [textC[1], textC[1] + textC[2]]));
  }

  append(v1, v2, v3, color, textC) {
    const start = this.data.points.length / 3;
    this.data.indices.push(start);
    this.data.indices.push(start + 1);
    this.data.indices.push(start + 2);
    for(let i = 0; i < 3 ; i++) {
      this.data.colors.push(color[0]);
      this.data.colors.push(color[1]);
      this.data.colors.push(color[2]);
      this.data.colors.push(color[3]);
    }
    const v1O = vec3.add([], v1, this.offset);
    const v2O = vec3.add([], v2, this.offset);
    const v3O = vec3.add([], v3, this.offset);
    this.addVertex(v1O, v1[3], v1[4], textC);
    this.addVertex(v2O, v2[3], v2[4], textC);
    this.addVertex(v3O, v3[3], v3[4], textC);
    const edge1 = vec3.subtract([], v2O, v1O);
    const edge2 = vec3.subtract([], v3O, v1O);
    const normal = vec3.cross([], edge1, edge2);
    vec3.normalize(normal, normal);
    this.data.normals.push(normal);
    this.data.normals.push(normal);
    this.data.normals.push(normal);
  }

}

class QuadBuilder {
  set offset(offset) {
    this._offset = offset;
    this.tris.offset = offset;
  }

  get offset() {
    return this._offset;
  }
  constructor(data, tris) {
    this.data = data;
    this._offset = [0, 0, 0];
    this.tris = tris ? tris : new TriangleBuilder(data);
  }

  append(v1, v2, v3, v4, color, textC) {
    this.tris.append(
      v1, v2, v3, color, textC
    );
    this.tris.append(
      v1, v3, v4, color, textC
    );
  }

}

Rotators = {
  x: new Map(),
  y: new Map(),
  z: new Map(),
  rotateY: function( degrees) {
    let quat = this.y.get(degrees);
    if (!quat) {
      quat = quat2.create();
      quat2.rotateY(quat, quat, degrees * Math.PI / 180);
      this.y.set(degrees, quat);
    }
    return quat;
  },
  rotateX: function( degrees) {
    let quat = this.x.get(degrees);
    if (!quat) {
      quat = quat2.create();
      quat2.rotateX(quat, quat, degrees * Math.PI / 180);
      this.x.set(degrees, quat);
    }
    return quat;
  },
  rotateZ: function( degrees) {
    let quat = this.z.get(degrees);
    if (!quat) {
      quat = quat2.create();
      quat2.rotateZ(quat, quat, degrees * Math.PI / 180);
      this.z.set(degrees, quat);
    }
    return quat;
  }
};

class Polygon {
  constructor() {

  }

  rotateZ(degrees) {
    if (!degrees) { return this; }
    const quat = Rotators.rotateZ(degrees);
    this.points.forEach(p => vec3.transformQuat(p, p, quat));
    return this;
  }

  rotateY(degrees) {
    if (!degrees) { return this; }
    const quat = Rotators.rotateY(degrees);
    this.points.forEach(p => vec3.transformQuat(p, p, quat));
    return this;
  }

  rotateX(degrees) {
    if (!degrees) { return this; }
    const quat = Rotators.rotateX(degrees);
    this.points.forEach(p => vec3.transformQuat(p, p, quat));
    return this;
  }

  left() {
    return this.rotateY(-90);
  }

  right() {
    return this.rotateY(90);
  }

  back() {
    return  this.rotateY(180);
  }

  top() {
    return  this.rotateX(-90);
  }

  bottom() {
    return this.rotateX(90);

  }
}

class Triangle extends Polygon {
  constructor(t, l, r) {
    super();
    this.d_t = t instanceof LVec ? t.data.slice() : t.slice();
    this.d_l = l instanceof LVec ? l.data.slice() : l.slice();
    this.d_r = r instanceof LVec ? r.data.slice() : r.slice();
    this.points = [  this.d_t,   this.d_l,   this.d_r];
  }

  add(x, y, z) {
    this.t.add(x, y, z);
    this.l.add(x, y, z);
    this.r.add(x, y, z);
    return this;
  }

  calcUv(x, y, s) {
    console.log(this.d_t, x, y);
    this.t.calcUv(x, y, s);
    this.l.calcUv(x, y, s);
    this.r.calcUv(x, y, s);
    return this;
  }

  clone() {
      return new Triangle(this.d_t, this.d_l, this.d_r);
  }

  get t() {
    if (!this._t) this._t = new LVec(this.d_t);
    return this._t;
  }

  get l() {
    if (!this._l) this._l = new LVec(this.d_l);
    return this._l;
  }

  get r() {
    if (!this._r) this._r = new LVec(this.d_r);
    return this._r;
  }

  appendTo(triBuilder, color, textC) {
    triBuilder.append(this.d_t,this.d_l,this.d_r,color, textC);
  }
}

class Quad extends Polygon {
  constructor(s, other) {
    super();
    this.s = s;
    this.d_bl = other ? other.d_bl.slice() : [-s, -s, s, 0, 0];
    this.d_br = other ? other.d_br.slice() : [s, -s, s, 0, 1];
    this.d_ur = other ? other.d_ur.slice() : [s, s, s, 1, 1];
    this.d_ul = other ? other.d_ul.slice() : [-s, s, s, 1, 0];
    this.points = [this.d_bl, this.d_br, this.d_ur, this.d_ul];
  }

  calcUv(x, y, s) {
    //return this;
    this.ul.calcUv(x, y, s);
    this.ur.calcUv(x, y, s);
    this.bl.calcUv(x, y, s);
    this.br.calcUv(x, y, s);
    return this;
  }

  add(x, y, z) {
    this.ul.add(x, y, z);
    this.bl.add(x, y, z);
    this.br.add(x, y, z);
    this.ur.add(x, y, z);
    return this;
  }

  clone(cb) {
    const clone =  new Quad(this.s, this);
    if (cb) { cb(clone); }
    return clone;
  }

  get ul() {
    if (!this._ul) this._ul = new LVec(this.d_ul);
    return this._ul;
  }

  get ur() {
    if (!this._ur) this._ur = new LVec(this.d_ur);
    return this._ur;
  }

  get br() {
    if (!this._br) this._br = new LVec(this.d_br);
    return this._br;
  }

  get bl() {
    if (!this._bl) this._bl = new LVec(this.d_bl);
    return this._bl;
  }

  appendTo(quadBuilder, color, textC) {
    quadBuilder.append(this.d_bl,this.d_br,this.d_ur,this.d_ul, color, textC);
  }
}
