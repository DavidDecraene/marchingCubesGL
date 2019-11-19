/*jshint esversion: 6 */

class QuadBuilder {
  constructor(data) {
    this.data = data;
  }

  fillIndices() {
    const start = this.data.points.length / 3;
    this.data.indices.push(start);
    this.data.indices.push(start + 1);
    this.data.indices.push(start + 2);
    this.data.indices.push(start);
    this.data.indices.push(start + 2);
    this.data.indices.push(start + 3);
  }

  fillColor(color) {
    for(let i = 0; i < 4 ; i++) {
      this.data.colors.push(color[0]);
      this.data.colors.push(color[1]);
      this.data.colors.push(color[2]);
      this.data.colors.push(color[3]);
    }
  }

}

class CubeBuilder {


  constructor(unit, data) {
    this.unitSize = unit === undefined ? 1.0 : unit;
    this.data = data ? data : new MeshData();
    this.offset = [0, 0, 0];
  }

  addVertex(x, y, z) {
    this.data.points.push(x + this.offset[0]);
    this.data.points.push(y + this.offset[1]);
    this.data.points.push(z + this.offset[2]);
  }

  fbl() {
    const s = this.unitSize;
    this.addVertex(-s , -s, s);
    return this;
  }

  fbr() {
    const s = this.unitSize;
    this.addVertex(s , -s, s);
    return this;
  }

  fur() {
    const s = this.unitSize;
    this.addVertex(s, s, s);
    return this;
  }

  ful() {
    const s = this.unitSize;
    this.addVertex(-s, s, s);
    return this;
  }

  bbl() {
    const s = this.unitSize;
    this.addVertex(-s, -s, -s);
    return this;
  }

  bbr() {
    const s = this.unitSize;
    this.addVertex(s, -s, -s);
    return this;
  }

  bur() {
    const s = this.unitSize;
    this.addVertex(s, s, -s);
    return this;
  }

  bul() {
    const s = this.unitSize;
    this.addVertex(-s, s, -s);
    return this;
  }

  fillQuadIndices() {
    const start = this.data.points.length / 3;
    this.data.indices.push(start);
    this.data.indices.push(start + 1);
    this.data.indices.push(start + 2);
    this.data.indices.push(start);
    this.data.indices.push(start + 2);
    this.data.indices.push(start + 3);
  }

  fillQuadColor(color) {
    for(let i = 0; i < 4 ; i++) {
      this.data.colors.push(color[0]);
      this.data.colors.push(color[1]);
      this.data.colors.push(color[2]);
      this.data.colors.push(color[3]);
    }
  }

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
  }
}
