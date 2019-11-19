/*jshint esversion: 6 */
class VoxelBuilder {

  constructor(voxelModel) {
    this.model = voxelModel;
    this.data = new MeshData();
    this.cubes = new CubeBuilder(0.5, this.data);
  }

  append(vector) {
    const vox = this.model.getVoxel(vector);
    if (!vox) return;
    this.cubes.offset = vector;
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
    const q = new QuadBuilder(this.data);
    q.fillIndices();
    q.fillColor([1.0,  1.0,  1.0,  1.0]);
    this.cubes.fbl().fbr().fur().ful();
  }

  buildBack(voxel, sides) {
    if (sides[1]) {
      return;
    }
    const q = new QuadBuilder(this.data);
    q.fillIndices();
    q.fillColor([1.0,  0.0,  0.0,  1.0]);
    this.cubes.bbl().bul().bur().bbr();
  }

  buildTop(voxel, sides) {
    if (sides[2]) {
      return;
    }
    const q = new QuadBuilder(this.data);
    q.fillIndices();
    q.fillColor([0.0,  1.0,  0.0,  1.0]);
    this.cubes.bul().ful().fur().bur();
  }

  buildBottom(voxel, sides) {
    if (sides[3]) {
      return;
    }
    const q = new QuadBuilder(this.data);
    q.fillIndices();
    q.fillColor([0.0,  0.0,  1.0,  1.0]);
    this.cubes.bbl().bbr().fbr().fbl();
  }

  buildRight(voxel, sides) {
    if (sides[4]) {
      return;
    }
    const q = new QuadBuilder(this.data);
    q.fillIndices();
    q.fillColor([1.0,  1.0,  0.0,  1.0]);
    this.cubes.bbr().bur().fur().fbr();
  }

  buildLeft(voxel, sides) {
    if (sides[5]) {
      return;
    }
    const q = new QuadBuilder(this.data);
    q.fillIndices();
    q.fillColor([1.0,  0.0,  1.0,  1.0]);
    this.cubes.bbl().fbl().ful().bul();
  }


}
