/*jshint esversion: 6 */
class VoxelBuilder {

  constructor(voxelModel) {
    this.mode = 1; // beveled cube, only indented corners
    //this.mode = 2; // beveled cube,  indented corners an borders
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
    // If everything is surrounded: return
    //
    this.buildFront(vox, sides);

    this.buildBack(vox, sides);
    this.buildTop(vox, sides);
    this.buildBottom(vox, sides);
    this.buildRight(vox, sides);
    this.buildLeft(vox, sides);

  }

  createBevel2Border() {
    const s = this.inset;
    const botQuad = new Quad(this.cubes.unitSize);
    botQuad.ul.y(botQuad.bl.y() + s);
    botQuad.ur.y(botQuad.br.y()  + s);
    botQuad.ul.add(s);
    botQuad.ur.add(-s);
    botQuad.bl.add(s, s/2, -s/2);
    botQuad.br.add(-s, s/2, -s/2);
    return botQuad;

  }

  createBevel1Border(ul, ur, bl, br) {
    const s = this.inset;
    const botQuad = new Quad(this.cubes.unitSize);
    botQuad.ul.y(botQuad.bl.y() + s);
    botQuad.ur.y(botQuad.br.y()  + s);
    if (ul) botQuad.ul.add(s);
    if (ur) botQuad.ur.add(-s);
    if (bl) botQuad.bl.add(s);
    if (br) botQuad.br.add(-s);
    return botQuad;
  }

  createBevel2Triangle() {
    const s = this.inset;
    const u = this.cubes.unitSize;
    // s, s/2, -s/2
    // const bl = new LVec([-u, -u, u]); // front bottom left.
    const blTri = new Triangle(
      [-u + s, -u + s/2, u - s/2],
      [-u + s, -u + s, u],
      [-u + s - s/2, -u + s, u  - s/2]);
    return blTri;
  }

  createBevel2Triangle2() {
    const s = this.inset;
    const u = this.cubes.unitSize;
    // s, s/2, -s/2
    // const bl = new LVec([-u, -u, u]); // front bottom left.
    const blTri = new Triangle(
      [-u + s, -u + s/2, u - s/2],
      [-u + s - s/2, -u + s, u  - s/2],
      [-u + s/2, -u +s/2, u - s ]);
    return blTri;
  }

  createBevel1Triangle() {
    const s = this.inset;
    const u = this.cubes.unitSize;
    // const bl = new LVec([-u, -u, u]); // front bottom left.
    // [ -u + s, -u + s, u]
    const blTri = new Triangle(
      [-u + s, -u, u],
      [-u, -u + s, u],
      [-u, -u, u -s]);
    return blTri;
  }

  buildQuads(flag, side) {
    const s = this.inset;
    const result = {
      quads: [], tris: []
    };
    const middle = new Quad(this.cubes.unitSize);
    result.quads.push(middle);
    let rotation = 0;
    let botQuad;
    if (this.mode === 1) {
      const genTris = side === 0 || side === 1;
      // do we need to draw the bot corners..
      switch(flag) {
        case 0: // No neighbours. All outer corners..
          middle.ul.add(s, -s);
          middle.ur.add(-s, -s);
          middle.bl.add(s, s);
          middle.br.add(-s, s);

          if (genTris) // bottom left, right and topleft: right corners.
          {
            result.tris.push(this.createBevel1Triangle());
            result.tris.push(this.createBevel1Triangle().rotateZ(90));
            result.tris.push(this.createBevel1Triangle().rotateZ(-90));
            result.tris.push(this.createBevel1Triangle().rotateZ(180));
          }
          result.quads.push(this.createBevel1Border(0, 0, 1, 1));
          result.quads.push(this.createBevel1Border(0, 0, 1, 1).rotateZ(180));

          result.quads.push(this.createBevel1Border(1, 1, 1, 1).rotateZ(-90));
          result.quads.push(this.createBevel1Border(1, 1, 1, 1).rotateZ(90));
          break;
        case 1: // 'top' is filled in..
        case 2: // only bot is filled in.
        case 4: // only right is filled in.
        case 8: // only left is filled in.
          if (flag === 2) rotation = 180;
          else  if (flag === 4) rotation = -90;
          else  if (flag === 8) rotation = 90;
          middle.ul.add(s);
          middle.ur.add(-s);
          middle.bl.add(s, s);
          middle.br.add(-s, s);
          middle.rotateZ(rotation);
          botQuad = this.createBevel1Border(0, 0, 1, 1);
          result.quads.push(botQuad.clone().rotateZ(rotation));
          // one side must be extended: right
          result.quads.push(botQuad.clone(c => c.br.add(s)).rotateZ(90 + rotation));
          // one side must be extended: left
          result.quads.push(botQuad.clone(c => c.bl.add(-s)).rotateZ(-90 + rotation));

          if (genTris) {
            const blTri = this.createBevel1Triangle();
            result.tris.push(blTri.clone().rotateZ(rotation));
            result.tris.push(blTri.clone().rotateZ(90 + rotation));
          }
          break;
        case 5: // top & right
        case 10:// left + bot
        // Adjacent outer corners
          if (flag === 10) rotation = -180;
          middle.ul.add(s);
          middle.bl.add(s, s);
          middle.br.add(0, s);
          middle.rotateZ(rotation);
          result.quads.push(this.createBevel1Border(0, 0, 1, 0).rotateZ(rotation));
          result.quads.push(this.createBevel1Border(0, 1, 0, 1).rotateZ(-90 + rotation));
          if (genTris) { result.tris.push(this.createBevel1Triangle().rotateZ(rotation)); }
          break;
          //console.log('bottom and right');
        case 9: // top & left
        case 6: // bot & right
        // Adjacent outer corners
          if (flag === 6) rotation = 180;
          middle.ur.add(-s);
          middle.br.add(-s, s);
          middle.bl.add(0, s);
          middle.rotateZ(rotation);
          result.quads.push(this.createBevel1Border(0, 0, 0, 1).rotateZ(rotation));
          result.quads.push(this.createBevel1Border(1, 0, 1, 0).rotateZ(90 + rotation));
          if (genTris) { result.tris.push(this.createBevel1Triangle().rotateZ(90 + rotation)); }
          break;
        // The next cases require no rounding (no outer corners)
        case 3: // Top and bottom
        case 12: // left & right
        // opposing: build plain cubes
          break;
        case 7: // bot & right & top
          //console.log('bottom and right & top');
          break;
        case 11: // left & bot & top
          //console.log('left and bot & top');
          break;
        case 13: // left & right & top
          //console.log('left and right & top');
          break;
        case 14: // left & right & bot
          //console.log('left and right & bot');
          break;
        case 15: // all corners: cube it..
          break;
      }

    } else if (this.mode === 2) {
      // This mode has considerably more triangles....
      const genTris = side === 0 || side === 1;
      // do we need to draw the bot corners..
      switch(flag) {
        case 0: // No neighbours. All outer corners..
          middle.ul.add(s, -s);
          middle.ur.add(-s, -s);
          middle.bl.add(s, s);
          middle.br.add(-s, s);
            result.quads.push(this.createBevel2Border());
            result.quads.push(this.createBevel2Border().rotateZ(180));
            result.quads.push(this.createBevel2Border().rotateZ(90));
            result.quads.push(this.createBevel2Border().rotateZ(-90));
            const blTri = this.createBevel2Triangle();
            result.tris.push(blTri.clone().rotateZ(rotation));
            result.tris.push(blTri.clone().rotateZ(90 + rotation));
            result.tris.push(blTri.clone().rotateZ(-90 + rotation));
            result.tris.push(blTri.clone().rotateZ(180 + rotation));
            if (genTris) {
              // Fill the stretched corner = points from 3 diff tris;
              result.tris.push(this.createBevel2Triangle2().rotateZ(rotation));
              result.tris.push(this.createBevel2Triangle2().rotateZ(90 + rotation));
              result.tris.push(this.createBevel2Triangle2().rotateZ(-90 + rotation));
              result.tris.push(this.createBevel2Triangle2().rotateZ(180 + rotation));
            }
          break;

        case 1: // 'top' is filled in..
        case 2: // only bot is filled in.
        case 4: // only right is filled in.
        case 8: // only left is filled in.
          if (flag === 2) rotation = 180;
          else  if (flag === 4) rotation = -90;
          else  if (flag === 8) rotation = 90;
          middle.ul.add(s);
          middle.ur.add(-s);
          middle.bl.add(s, s);
          middle.br.add(-s, s);
          middle.rotateZ(rotation);
          result.quads.push(this.createBevel2Border());
          result.quads.push(this.createBevel2Border().rotateZ(90));
          result.quads.push(this.createBevel2Border().rotateZ(-90));
          result.tris.push(this.createBevel2Triangle().rotateZ(rotation));
          //result.tris.push(this.createBevel2Triangle().rotateZ(-90 + rotation));
          result.tris.push(this.createBevel2Triangle().rotateZ(90 + rotation));
          if (genTris) {
            // Fill the stretched corner = points from 3 diff tris;
            result.tris.push(this.createBevel2Triangle2().rotateZ(rotation));
            result.tris.push(this.createBevel2Triangle2().rotateZ(90 + rotation));
          }
          break;

        case 5: // top & right
        case 10:// left + bot
        // Adjacent outer corners
          if (flag === 10) rotation = -180;
          middle.ul.add(s);
          middle.bl.add(s, s);
          middle.br.add(0, s);
          middle.rotateZ(rotation);
          // TODO:
          //result.quads.push(this.createBevel2Border().rotateZ(rotation));
          //result.quads.push(this.createBevel2Border().rotateZ(-90 + rotation));
          if (genTris) {
          }
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
    const r = this.buildQuads(flag, 0);
    r.quads.forEach(q => q.appendTo(this.quads, color));
    r.tris.forEach(q => q.appendTo(this.tris, color));
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
    const r = this.buildQuads(flag, 1);
    r.quads.forEach(q => q.back().appendTo(this.quads, color));
    r.tris.forEach(q => q.back().appendTo(this.tris, color));
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
    const r = this.buildQuads(flag, 2);
    r.quads.forEach(q => q.top().appendTo(this.quads, color)); // Something wrong
    r.tris.forEach(q => q.top().appendTo(this.tris, color));
  }

  buildBottom(voxel, sides) {
    if (sides[3]) {
      return;
    }
    const color = [0.0,  0.0,  1.0,  1.0];
    let flag = 0;
    if (sides[0]) flag = BitFlags.set(flag, 1 << 0); // top
    if (sides[1]) flag = BitFlags.set(flag, 1 << 1); // bot
    if (sides[4]) flag = BitFlags.set(flag, 1 << 2); // right
    if (sides[5]) flag = BitFlags.set(flag, 1 << 3); // left
    const r = this.buildQuads(flag, 3);
    r.quads.forEach(q => q.bottom().appendTo(this.quads, color));
    r.tris.forEach(q => q.bottom().appendTo(this.tris, color));
  }

  buildRight(voxel, sides) {
    if (sides[4]) {
      return;
    }
    const color = [1.0,  1.0,  0.0,  1.0];
    let flag = 0;
    if (sides[2]) flag = BitFlags.set(flag, 1 << 0); // top
    if (sides[3]) flag = BitFlags.set(flag, 1 << 1); // bot
    if (sides[1]) flag = BitFlags.set(flag, 1 << 2); // right
    if (sides[0]) flag = BitFlags.set(flag, 1 << 3); // left
    const r = this.buildQuads(flag, 4);
    r.quads.forEach(q => q.right().appendTo(this.quads, color));
    r.tris.forEach(q => q.right().appendTo(this.tris, color));
  }

  buildLeft(voxel, sides) {
    if (sides[5]) {
      return;
    }
    const color = [1.0,  0.0,  1.0,  1.0];
    let flag = 0;
    if (sides[2]) flag = BitFlags.set(flag, 1 << 0); // top
    if (sides[3]) flag = BitFlags.set(flag, 1 << 1); // bot
    if (sides[0]) flag = BitFlags.set(flag, 1 << 2); // right
    if (sides[1]) flag = BitFlags.set(flag, 1 << 3); // left
    const r = this.buildQuads(flag, 5);
    r.quads.forEach(q => q.left().appendTo(this.quads, color));
    r.tris.forEach(q => q.left().appendTo(this.tris, color));
  }


}
