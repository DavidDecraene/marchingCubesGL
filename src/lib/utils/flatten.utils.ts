import { vec3 } from 'gl-matrix';


export const FlattenUtils = {
  toIndex: function(valueVector: vec3, dimensionVector: vec3) {
    if (valueVector[2] < 0 || valueVector[2] >= dimensionVector[2]) return -1;
    if (valueVector[1] < 0 || valueVector[1] >= dimensionVector[1]) return -1;
    if (valueVector[0] < 0 || valueVector[0] >= dimensionVector[0]) return -1;
    const yy = valueVector[1] * dimensionVector[1];
    const xx = valueVector[0] * dimensionVector[0] * dimensionVector[1];
    return xx + yy + valueVector[2];
  },
  fromIndex: function(value: number, dimensionVector: vec3) {
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

    const arr = [Math.floor(x/l), Math.floor(y/dimensionVector[1]), zRest];
    return arr;
  }, unsplit: function(outer: vec3, inner: vec3, sizeVector: vec3) {
    const x = outer[0] * sizeVector[0] + inner[0];
    const y = outer[1] * sizeVector[1] + inner[1];
    const z = outer[2] * sizeVector[2] + inner[2];
    return [x, y, z];
  }, split:  function(vector: vec3, sizeVector: vec3) {
    const x = Math.floor(vector[0] / sizeVector[0]);
    const y = Math.floor(vector[1] / sizeVector[1]);
    const z = Math.floor(vector[2] / sizeVector[2]);

    const xRest = Math.floor(vector[0] - ( x * sizeVector[0]));
    const yRest = Math.floor(vector[1] - ( y * sizeVector[1]));
    const zRest = Math.floor(vector[2] - ( z * sizeVector[2]));
    return {
      outer: [x, y, z] as vec3,
      inner: [xRest, yRest, zRest] as vec3
    };
  }

};
