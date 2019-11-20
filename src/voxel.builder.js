/*jshint esversion: 6 */
class VoxelBuilder {

  constructor(voxelModel) {
    this.mode = 1; // beveled cube, only indented corners
    this.model = voxelModel;
    this.data = new MeshData();
    this.cubes = new CubeBuilder(0.5, this.data);
    this.tris = new TriangleBuilder(this.data);
    this.quads = new QuadBuilder(this.data, this.tris);
    this.inset = 0.1;
  }

  append(vector) {
    const vox = this.model.getVoxel(vector);
    if (!vox) return;
    this.quads.offset = vector;
  //  this.tris.offset = vector;
    const front = this.model.getVoxel(vec3.fromValues(vector[0], vector[1], vector[2] + 1));
    const back = this.model.getVoxel(vec3.fromValues(vector[0], vector[1], vector[2] - 1));
    const top = this.model.getVoxel(vec3.fromValues(vector[0], vector[1] + 1, vector[2]));
    const bottom = this.model.getVoxel(vec3.fromValues(vector[0], vector[1] - 1, vector[2]));
    const right = this.model.getVoxel(vec3.fromValues(vector[0] +1, vector[1], vector[2]));
    const left = this.model.getVoxel(vec3.fromValues(vector[0] - 1, vector[1] , vector[2]));
    const sides = [front, back, top, bottom, right, left];
    this.buildFront(vox, sides);

    this.buildBack(vox, sides);
    this.buildTop(vox, sides);
    this.buildBottom(vox, sides);
    this.buildRight(vox, sides);
    this.buildLeft(vox, sides);

  }

  buildQuads(flag) {
    const s = this.inset;
    const result = {
      quads: []
    };
    const middle = new Quad(this.cubes.unitSize);
    result.quads.push(middle);
    if (this.mode === 1) {
      // do we need to draw the bot corners..
      switch(flag) {
        case 0: // No neighbours. All corners..
          middle.ul.add(s, -s);
          middle.ur.add(-s, -s);
          middle.bl.add(s, s);
          middle.br.add(-s, s);
          const botQuad = new Quad(this.cubes.unitSize);
          botQuad.ul.y(botQuad.bl.y() + s);
          botQuad.ur.y(botQuad.br.y()  + s);
          botQuad.bl.add(s);
          botQuad.br.add(-s);
          result.quads.push(botQuad);

          const topQuad = new Quad(this.cubes.unitSize);
          topQuad.bl.y(topQuad.ul.y() - s);
          topQuad.br.y(topQuad.ur.y() - s);
          topQuad.ul.add(s);
          topQuad.ur.add(-s);
          result.quads.push(topQuad);

          const leftQuad = new Quad(this.cubes.unitSize);
          leftQuad.br.x(leftQuad.bl.x() + s);
          leftQuad.ur.x(leftQuad.ul.x() + s);
          leftQuad.ul.add(0, -s);
          leftQuad.bl.add(0, s);
          result.quads.push(leftQuad);

          const rightQuad = new Quad(this.cubes.unitSize);
          rightQuad.bl.x(rightQuad.br.x() - s);
          rightQuad.ul.x(rightQuad.ur.x() - s);
          rightQuad.ur.add(0, -s);
          rightQuad.br.add(0, s);
          result.quads.push(rightQuad);
          break;

      }

    }
    return result;
  }

  buildFront(voxel, sides) {
    if (sides[0]) {
      return;
    }
    const color = [1.0,  1.0,  1.0,  1.0];
    let flag = 0;
    if (sides[2]) flag = BitFlags.set(flag, 1 << 0); // top
    if (sides[3]) flag = BitFlags.set(flag, 1 << 1); // bot
    if (sides[4]) flag = BitFlags.set(flag, 1 << 2); // right
    if (sides[5]) flag = BitFlags.set(flag, 1 << 3); // left
    const r = this.buildQuads(flag);
    r.quads.forEach(q => q.appendTo(this.quads, color));
    if(this.mode === 2) {
      console.log(flag);
      // 16 possibilities...
      /**
      switch(flag) {
        case 0: // No neighbours.
          break;
        case 1:
          // only the top is set.
          new LVec(fbr).add(-s, s);
          new LVec(fbl).add(s, s);
          new LVec(fur).add(-s);
          new LVec(ful).add(s);
          // An extra quad from bottom side to bottom
          const bfbl = new LVec(this.cubes.fbl()).add(s, 0, -s);
          const bfbr = new LVec(this.cubes.fbr()).add(-s, 0, -s);
          this.quads.append(bfbl.data, bfbr.data, fbr, fbl, color);
          const tful = new LVec(this.cubes.ful()).add(0, 0, -s);
          const bfbl2 = new LVec(this.cubes.fbl()).add(0, s, -s);
          this.quads.append(tful.data, bfbl2.data, fbl, ful, color);
          const tfur = new LVec(this.cubes.fur()).add(0, 0, -s);
          const bfbr2 = new LVec(this.cubes.fbr()).add(0, s, -s);
          this.quads.append(fbr, bfbr2.data, tfur.data, fur, color);
          // Add a triangle bottom left and bottom right.
          this.tris.append(bfbl.data, fbl, bfbl2.data, color);
          this.tris.append(bfbr2.data, fbr, bfbr.data, color);
          break;
        case 2: // only bot is set..
          break;
        case 3: // top & bot
          break;
        case 4: // only right
          break;
        case 5: // right & top
          break;
        case 6: // right & bot
          break;
        case 7: // right & bot & top
          break;
        case 8: // only left
          break;
        // etc etc ...
      } */
    }
    //middle.appendTo(this.quads, color);
  }

  buildBack(voxel, sides) {
    if (sides[1]) {
      return;
    }
    const color = [1.0,  0.0,  0.0,  1.0];
    let flag = 0;
    if (sides[2]) flag = BitFlags.set(flag, 1 << 0); // top
    if (sides[3]) flag = BitFlags.set(flag, 1 << 1); // bot
    if (sides[5]) flag = BitFlags.set(flag, 1 << 2); // right
    if (sides[4]) flag = BitFlags.set(flag, 1 << 3); // left
    const r = this.buildQuads(flag);
    r.quads.forEach(q => q.back().appendTo(this.quads, color));
  }

  buildTop(voxel, sides) {
    if (sides[2]) {
      return;
    }
    const color = [0.0,  1.0,  0.0,  1.0];
    let flag = 0;
    if (sides[1]) flag = BitFlags.set(flag, 1 << 0); // top
    if (sides[0]) flag = BitFlags.set(flag, 1 << 1); // bot
    if (sides[4]) flag = BitFlags.set(flag, 1 << 2); // right
    if (sides[5]) flag = BitFlags.set(flag, 1 << 3); // left
    const r = this.buildQuads(flag);
    r.quads.forEach(q => q.top().appendTo(this.quads, color)); // Something wrong
  }

  buildBottom(voxel, sides) {
    if (sides[3]) {
      return;
    }
    new Quad(this.cubes.unitSize).bottom().appendTo(this.quads, [0.0,  0.0,  1.0,  1.0]);
  }

  buildRight(voxel, sides) {
    if (sides[4]) {
      return;
    }
    new Quad(this.cubes.unitSize).right().appendTo(this.quads, [1.0,  1.0,  0.0,  1.0]);
  }

  buildLeft(voxel, sides) {
    if (sides[5]) {
      return;
    }
    new Quad(this.cubes.unitSize).left().appendTo(this.quads, [1.0,  0.0,  1.0,  1.0]);
  }


}
