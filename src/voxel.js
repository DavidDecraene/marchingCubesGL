/*jshint esversion: 6 */

var BitFlags = {
  set: function(value, flag) {
    // shorthand: value |= flag;
    return value | flag;
  },
  isSet: function(value, flag) {
    return (value & flag) == flag;
  },
  unSet: function(value, flag) {
    return value & ~flag;
  }

};

var voxels = {
  FRONT: 1 << 0,
  BACK: 1 << 1,
  TOP: 1 << 2,
  BOTTOM: 1 << 3,
  LEFT: 1 << 4,
  RIGHT: 1 << 5
};

class AbstractVoxelModel {
  constructor(sectorSize) {
    this.sectorSize = sectorSize;
    this.sectorModel = new FlatModel(sectorSize);
    this.sectors = {};
  }

  getVoxel(vector) {
    const spl = this.sectorModel.split(vector);
    // Outer => from sectors
    // Inner => from retrieval
  }

  getNeighbourFlag(vector) {

  }
}

var FlattenUtils = {
  toIndex: function(valueVector, dimensionVector) {
    if (valueVector[2] < 0 || valueVector[2] >= dimensionVector[2]) return -1;
    if (valueVector[1] < 0 || valueVector[1] >= dimensionVector[1]) return -1;
    if (valueVector[0] < 0 || valueVector[0] >= dimensionVector[0]) return -1;
    const yy = valueVector[1] * dimensionVector[1];
    const xx = valueVector[0] * dimensionVector[0] * dimensionVector[1];
    return xx + yy + valueVector[2];
  },
  fromIndex: function(value, dimensionVector) {
    value = Math.floor(value);
    if (value < 0) return undefined;
    const l = dimensionVector[0] * dimensionVector[1];
    if (value < l * dimensionVector[2]) return undefined;
    const yRest = value % l;
    const x = value - yRest;
		const zRest = yRest % dimensionVector[1];
		const y = yRest - zRest;
    return [Math.floor(x/l), Math.floor(y/dimensionVector[1]), zRest];
  }

};


class FlatModel {
  constructor(sizeVector) {

  }

  unsplit(outer, inner) {
    const x = outer[0] * this.sizeVector[0] + inner[0];
    const y = outer[1] * this.sizeVector[1] + inner[1];
    const z = outer[2] * this.sizeVector[2] + inner[2];
    return [x, y, z];
  }

  split(vector) {
    const x = Math.floor(vector[0] / this.sizeVector[0]);
    const y = Math.floor(vector[1] / this.sizeVector[1]);
    const z = Math.floor(vector[2] / this.sizeVector[2]);

    const xRest = Math.Floor(vector[0] - ( x * this.sizeVector[0]));
    const yRest = Math.Floor(vector[1] - ( y * this.sizeVector[1]));
    const zRest = Math.Floor(vector[2] - ( z * this.sizeVector[2]));
    return {
      outer: [x, y, z],
      inner: [xRest, yRest, zRest]
    };
  }
}



class FlatArray {
  constructor(vector) {

    this.size = vector[0] * vector[1] * vector[2];
    this.dimensions = vector;
    this.values = [];
  }


  setData(vector, data) {
    const index = FlattenUtils.toIndex(vector, this.dimensions);
    if (index < 0 ) return false;
    this.values[index] = data;
    return true;
  }

  getData(vector) {
    const index = FlattenUtils.toIndex(vector, this.dimensions);
    if (index < 0 ) return undefined;
    return this.values[index];
  }
}
