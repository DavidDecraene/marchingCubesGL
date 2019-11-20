/*jshint esversion: 6 */

class TriangleBuilder {
  constructor(data) {
    this.data = data;
    this.offset = [0, 0, 0];
  }

  addVertex(v) {
    this.data.points.push(v[0]);
    this.data.points.push(v[1]);
    this.data.points.push(v[2]);
  }

  append(v1, v2, v3, color) {
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
    this.addVertex(v1O);
    this.addVertex(v2O);
    this.addVertex(v3O);
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

  append(v1, v2, v3, v4, color) {
    this.tris.append(
      v1, v2, v3, color
    );
    this.tris.append(
      v1, v3, v4, color
    );
  }

}

class Quad {
  // TODO: Use matrix rotations instead...
  constructor(s) {
    this.d_bl = [-s, -s, s];
    this.d_br = [s, -s, s];
    this.d_ur = [s, s, s];
    this.d_ul = [-s, s, s];
    this.front = true;
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

  y90() {
    if (this.front) {
      this.d_bl[0] *= -1;
      this.d_ul[0] *= -1;
      this.d_ur[2] *= -1;
      this.d_br[2] *= -1;
    } else {
      this.d_bl[2] *= -1;
      this.d_ul[2] *= -1;
      this.d_ur[0] *= -1;
      this.d_br[0] *= -1;
    }
    this.front = !this.front;
    return this;
  }

  left() {
    this.y90().y90().y90();
    return this;
  }

  right() {
    this.y90();
    return this;
  }

  back() {
    this.y90().y90();
    return this;
  }

  top() {
    // console.log(this.d_bl[1], 'top');
    this.d_bl[1] *= -1;
    this.d_br[1] *= -1;
    this.d_ur[2] *= -1;
    this.d_ul[2] *= -1;
    return this;
  }

  bottom() {
    this.d_bl[2] *= -1;
    this.d_br[2] *= -1;
    this.d_ur[1] *= -1;
    this.d_ul[1] *= -1;
    return this;

  }

  appendTo(quadBuilder, color) {
    quadBuilder.append(this.d_bl,this.d_br,this.d_ur,this.d_ul, color);
  }
}

class CubeBuilder {


  constructor(unit, data, quads) {
    this.unitSize = unit === undefined ? 1.0 : unit;
    this.data = data ? data : new MeshData();
  }

  fbl() {
    const s = this.unitSize;
    return [-s, -s, s];
  }

  fbr() {
    const s = this.unitSize;
    return [s, -s, s];
  }

  fur() {
    const s = this.unitSize;
    return [s, s, s];
  }

  ful() {
    const s = this.unitSize;
    return [-s, s, s];
  }

  bbl() {
    const s = this.unitSize;
    return [-s, -s, -s];
  }

  bbr() {
    const s = this.unitSize;
    return [s, -s, -s];
  }

  bur() {
    const s = this.unitSize;
    return [s, s, -s];
  }

  bul() {
    const s = this.unitSize;
   return [-s, s, -s];
  }

  /**

  frontFace(color) { // Front face
    const q = new QuadBuilder(this.data);
    q.fillIndices();
    q.fillColor(color);
    this.fbl().fbr().fur().ful();
  }

  backFace(color) {
    this.fillQuadIndices();
    this.bbl().bul().bur().bbr();
    this.fillQuadColor(color);
  }

  topFace(color) {
    this.fillQuadIndices();
    this.bul().ful().fur().bur();
    this.fillQuadColor(color);
  }

  bottomFace(color) {
    this.fillQuadIndices();
    this.bbl().bbr().fbr().fbl();
    this.fillQuadColor(color);
  }

  rightFace(color) {
    this.fillQuadIndices();
    this.bbr().bur().fur().fbr();
    this.fillQuadColor(color);
  }

  leftFace(color) {
    this.fillQuadIndices();
    this.bbl().fbl().ful().bul();
    this.fillQuadColor(color);
  } */
}
