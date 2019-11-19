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

class LVec {
  constructor(data) {
    this.data = data;
  }

  add(x, y, z) {
    if(x) this.data[0] += x;
    if(y) this.data[1] += y;
    if(z) this.data[2] += z;
    return this;
  }


}



var voxels = {
  FRONT: 1 << 0,
  BACK: 1 << 1,
  TOP: 1 << 2,
  BOTTOM: 1 << 3,
  LEFT: 1 << 4,
  RIGHT: 1 << 5
};

class VoxelSector {
  constructor(key, index, sectorSize) {
    this.key = key;
    this.index = index;
    this.sectorSize = sectorSize;
    this.values = new FlatArray(sectorSize);
  }

  getVoxels() {
    return Object.keys(this.values.values).map(k => {
      const idx = FlattenUtils.fromIndex(k, this.sectorSize);
      return FlattenUtils.unsplit(this.index, idx, this.sectorSize);
    });
  }
}

class VoxelModel {
  constructor(sectorSize) {
    this.sectorSize = sectorSize;
    this.sectors = {};
  }

  getSectors() {
    const values = Object.keys(this.sectors).map(k => this.sectors[k]);
    return values;
  }

  vectorKey(vector) {
    return vector[0]+ '_' + vector[1] + '_' + vector[2];
  }

  setVoxel(vector, data) {
    const spl = FlattenUtils.split(vector, this.sectorSize);
    const sectorKey = this.vectorKey(spl.outer);
    if(!this.sectors[sectorKey]) {
      this.sectors[sectorKey] = new VoxelSector(sectorKey, spl.outer, this.sectorSize);
    }
    return this.sectors[sectorKey].values.setData(spl.inner, data);
  }

  getVoxel(vector) {
    const spl = FlattenUtils.split(vector, this.sectorSize);
    const sectorKey = this.vectorKey(spl.outer);
    const sector = this.sectors[sectorKey];
    if(!sector) return undefined;
    // console.log(Object.keys(sector.values.values));
    return sector.values.getData(spl.inner);
    // Outer => from sectors
    // Inner => from retrieval
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
    if (value >= l * dimensionVector[2]) {
      return undefined;
    }
    const yRest = value % l;
    const x = value - yRest;
		const zRest = yRest % dimensionVector[1];
		const y = yRest - zRest;
    return [Math.floor(x/l), Math.floor(y/dimensionVector[1]), zRest];
  }, unsplit: function(outer, inner, sizeVector) {
    const x = outer[0] * sizeVector[0] + inner[0];
    const y = outer[1] * sizeVector[1] + inner[1];
    const z = outer[2] * sizeVector[2] + inner[2];
    return [x, y, z];
  }, split:  function(vector, sizeVector) {
    const x = Math.floor(vector[0] / sizeVector[0]);
    const y = Math.floor(vector[1] / sizeVector[1]);
    const z = Math.floor(vector[2] / sizeVector[2]);

    const xRest = Math.floor(vector[0] - ( x * sizeVector[0]));
    const yRest = Math.floor(vector[1] - ( y * sizeVector[1]));
    const zRest = Math.floor(vector[2] - ( z * sizeVector[2]));
    return {
      outer: [x, y, z],
      inner: [xRest, yRest, zRest]
    };
  }

};


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
