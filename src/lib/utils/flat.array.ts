import { vec3 } from 'gl-matrix';
import { FlattenUtils } from './flatten.utils';

export class FlatArray {
  public readonly dimensions: vec3;
  public readonly size: number;
  public readonly values: Array<any> = [];
  constructor(vector: vec3) {

    this.size = vector[0] * vector[1] * vector[2];
    this.dimensions = vector;
  }


  setData(vector: vec3, data: any) {
    const index = FlattenUtils.toIndex(vector, this.dimensions);
    if (index < 0 ) return false;
    this.values[index] = data;
    return true;
  }

  getData(vector: vec3): any {
    const index = FlattenUtils.toIndex(vector, this.dimensions);
    if (index < 0 ) return undefined;
    return this.values[index];
  }
}
