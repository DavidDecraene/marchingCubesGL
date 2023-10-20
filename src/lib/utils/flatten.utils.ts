import { IVector3, Vector3 } from '../data/Vector3';

export const FlattenUtils = {
  toIndex: function(valueVector: IVector3, dimensionVector: IVector3): number {
    if (valueVector.z < 0 || valueVector.z >= dimensionVector.z) return -1;
    if (valueVector.y < 0 || valueVector.y >= dimensionVector.y) return -1;
    if (valueVector.x < 0 || valueVector.x >= dimensionVector.x) return -1;
    const yy = valueVector.y * dimensionVector.y;
    const xx = valueVector.x * dimensionVector.x * dimensionVector.y;
    return xx + yy + valueVector.z;
  },
  fromIndex: function(value: number, dimensionVector: IVector3): IVector3 | undefined {
    value = Math.floor(value);
    if (value < 0) return undefined;
    const l = dimensionVector.x * dimensionVector.y;
    if (value >= l * dimensionVector.z) {
      return undefined;
    }
    const yRest = value % l;
    const x = value - yRest;
		const zRest = yRest % dimensionVector.y;
		const y = yRest - zRest;

    const arr = Vector3.of(Math.floor(x/l), Math.floor(y/dimensionVector.y), zRest);
    return arr;
  }, unsplit: function(outer: IVector3, inner: IVector3, sizeVector: IVector3): IVector3 {
    const x = outer.x * sizeVector.x + inner.x;
    const y = outer.y * sizeVector.y + inner.y;
    const z = outer.z * sizeVector.z + inner.z;
    return Vector3.of(x, y, z);
  }, split:  function(vector: IVector3, sizeVector: IVector3) {
    const x = Math.floor(vector.x / sizeVector.x);
    const y = Math.floor(vector.y / sizeVector.y);
    const z = Math.floor(vector.z / sizeVector.z);

    const xRest = Math.floor(vector.x - ( x * sizeVector.x));
    const yRest = Math.floor(vector.y - ( y * sizeVector.y));
    const zRest = Math.floor(vector.z - ( z * sizeVector.z));
    return {
      outer: Vector3.of(x, y, z),
      inner: Vector3.of(xRest, yRest, zRest)
    };
  }

};
