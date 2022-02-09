import { vec3, vec4 } from 'gl-matrix';
import { MeshData } from '../data/mesh';
import { TexCoords } from '../data/TexCoords';
import { TriangleBuilder } from './triangle.builder';

export class QuadBuilder {
  private _offset = vec3.fromValues(0, 0, 0);
  private tris: TriangleBuilder;

  set offset(offset: vec3) {
    this._offset = offset;
    this.tris.offset = offset;
  }

  get offset(): vec3 {
    return this._offset;
  }
  constructor(public readonly data: MeshData, tris: TriangleBuilder) {
    this.tris = tris ? tris : new TriangleBuilder(data);
  }

  append(v1: Array<number>, v2: Array<number>, v3: Array<number>, v4: Array<number>,
    color: vec4, textC: TexCoords) {
    this.tris.append(
      v1, v2, v3, color, textC
    );
    this.tris.append(
      v1, v3, v4, color, textC
    );
  }

}
