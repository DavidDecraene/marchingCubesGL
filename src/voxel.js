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

var LVecs = {
  add: function(result, target) {
      result[0] += target[0];
      result[1] += target[1];
      result[2] += target[2];
      return result;
  },
  rescale: function(value, fromRange, toRange) {
    if (!value) { value = 0; }
    const a = (value - fromRange[0]) / (fromRange[1] - fromRange[0]);
    const b = toRange[1] - toRange[0];
    return a * b + toRange[0];
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

  calcUv(x, y, s) {
    this.data[3] =  (this.data[x] + s) / (2 * s);
    // problem is: bot left is zero, so 1 becomes zero and zero becomes one
    this.data[4] =  1 - (this.data[y] + s) / (2 * s);
    return this;
  }

  x(x) {
    if (x === undefined) return this.data[0];
    this.data[0] = x;
    return this;
  }

  y(y) {
    if (y === undefined) return this.data[1];
    this.data[1] = y;
    return this;
  }

  z(z) {
    if (z === undefined) return this.data[2];
    this.data[2] = z;
    return this;
  }

  u(u) {
    if (u === undefined) return this.data[3];
    this.data[3] = u;
    return this;
  }

  v(v) {
    if (v === undefined) return this.data[4];
    this.data[4] = v;
    return this;
  }

  copy(other) {
    this.data = other.data.slice();
    return this;
  }

  clone() {
    const data = this.data.slice();
    return new LVec(data);
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

class VoxelSet {
  constructor() {
    this.values = [];
  }

  translate(x, y, z) {
    this.values.forEach(v => {
      v.v[0] += x ? x : 0;
      v.v[1] += y ? y : 0;
      v.v[2] += z ? z : 0;
    });
  }

  setVoxel(vector, data) {
    this.values.push({ v: vector, d: data});
  }

  appendTo(model) {
    this.values.forEach(v => {
      model.setVoxel(v.v, v.d);
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
