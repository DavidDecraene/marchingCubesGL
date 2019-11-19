/*jshint esversion: 6 */
class VoxelBuilder {

  constructor(voxelModel) {
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

  buildFront(voxel, sides) {
    if (sides[0]) {
      return;
    }
    const s = this.inset;
    const indent = true;
    const color = [1.0,  1.0,  1.0,  1.0];
    const fur = this.cubes.fur();
    const ful = this.cubes.ful();
    const fbl = this.cubes.fbl();
    const fbr = this.cubes.fbr();
    if (indent) {
      let flag = 0;
      if (sides[2]) flag = BitFlags.set(flag, 1 << 0); // top
      if (sides[3]) flag = BitFlags.set(flag, 1 << 1); // bot
      if (sides[4]) flag = BitFlags.set(flag, 1 << 2); // right
      if (sides[5]) flag = BitFlags.set(flag, 1 << 3); // left
      console.log(flag);
      // 16 possibilities...
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
      }
    }
    this.quads.append(fbl,fbr,fur,ful, color);
  }

  buildBack(voxel, sides) {
    if (sides[1]) {
      return;
    }
    this.quads.append(
      this.cubes.bbl(),
      this.cubes.bul(),
      this.cubes.bur(),
      this.cubes.bbr(),
      [1.0,  0.0,  0.0,  1.0]);
  }

  buildTop(voxel, sides) {
    if (sides[2]) {
      return;
    }
    this.quads.append(
      this.cubes.bul(),
      this.cubes.ful(),
      this.cubes.fur(),
      this.cubes.bur(),
      [0.0,  1.0,  0.0,  1.0]);
  }

  buildBottom(voxel, sides) {
    if (sides[3]) {
      return;
    }
    this.quads.append(
      this.cubes.bbl(),
      this.cubes.bbr(),
      this.cubes.fbr(),
      this.cubes.fbl(),
      [0.0,  0.0,  1.0,  1.0]);
  }

  buildRight(voxel, sides) {
    if (sides[4]) {
      return;
    }
    this.quads.append(
      this.cubes.bbr(),
      this.cubes.bur(),
      this.cubes.fur(),
      this.cubes.fbr(),
      [1.0,  1.0,  0.0,  1.0]);
  }

  buildLeft(voxel, sides) {
    if (sides[5]) {
      return;
    }
    this.quads.append(
      this.cubes.bbl(),
      this.cubes.fbl(),
      this.cubes.ful(),
      this.cubes.bul(),
      [1.0,  0.0,  1.0,  1.0]);
  }


}
