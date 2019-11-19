/*jshint esversion: 6 */
class CubeBuilder {


  constructor(unit) {
    this.unitSize = unit === undefined ? 1.0 : unit;
    this.points  = [];
    this.colors  = [];
    this.indices = [];
  }

  addVertex(x, y, z) {
    this.points.push(x);
    this.points.push(y);
    this.points.push(z);
  }

  fbl() {
    const s = this.unitSize;
    this.addVertex(-s, -s, s);
    return this;
  }

  fbr() {
    const s = this.unitSize;
    this.addVertex(s, -s, s);
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
    const start = this.points.length / 3;
    this.indices.push(start);
    this.indices.push(start + 1);
    this.indices.push(start + 2);
    this.indices.push(start);
    this.indices.push(start + 2);
    this.indices.push(start + 3);
  }

  fillQuadColor(color) {
    for(let i = 0; i < 4 ; i++) {
      this.colors.push(color[0]);
      this.colors.push(color[1]);
      this.colors.push(color[2]);
      this.colors.push(color[3]);
    }
  }

  frontFace(color) { // Front face
    this.fillQuadIndices();
    this.fbl().fbr().fur().ful();
    this.fillQuadColor(color);
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
