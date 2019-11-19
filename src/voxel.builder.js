/*jshint esversion: 6 */
class VoxelBuilder {

  constructor(voxelModel) {
    this.model = voxelModel;
    this.data = new MeshData();
    this.cubes = new CubeBuilder(0.5, this.data);
    this.tris = new TriangleBuilder(this.data);
    this.quads = new QuadBuilder(this.data, this.tris);
  }

  append(vector) {
    const vox = this.model.getVoxel(vector);
    if (!vox) return;
    this.quads.offset = vector;
  //  this.tris.offset = vector;
    console.log(vector);
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
    this.quads.append(
      this.cubes.fbl(true),
      this.cubes.fbr(true),
      this.cubes.fur(true),
      this.cubes.ful(true),
      [1.0,  1.0,  1.0,  1.0]);
  }

  buildBack(voxel, sides) {
    if (sides[1]) {
      return;
    }
    this.quads.append(
      this.cubes.bbl(true),
      this.cubes.bul(true),
      this.cubes.bur(true),
      this.cubes.bbr(true),
      [1.0,  0.0,  0.0,  1.0]);
  }

  buildTop(voxel, sides) {
    if (sides[2]) {
      return;
    }
    this.quads.append(
      this.cubes.bul(true),
      this.cubes.ful(true),
      this.cubes.fur(true),
      this.cubes.bur(true),
      [0.0,  1.0,  0.0,  1.0]);
  }

  buildBottom(voxel, sides) {
    if (sides[3]) {
      return;
    }
    this.quads.append(
      this.cubes.bbl(true),
      this.cubes.bbr(true),
      this.cubes.fbr(true),
      this.cubes.fbl(true),
      [0.0,  0.0,  1.0,  1.0]);
  }

  buildRight(voxel, sides) {
    if (sides[4]) {
      return;
    }
    this.quads.append(
      this.cubes.bbr(true),
      this.cubes.bur(true),
      this.cubes.fur(true),
      this.cubes.fbr(true),
      [1.0,  1.0,  0.0,  1.0]);
  }

  buildLeft(voxel, sides) {
    if (sides[5]) {
      return;
    }
    this.quads.append(
      this.cubes.bbl(true),
      this.cubes.fbl(true),
      this.cubes.ful(true),
      this.cubes.bul(true),
      [1.0,  0.0,  1.0,  1.0]);
  }


}
