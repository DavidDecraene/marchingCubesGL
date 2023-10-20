import { vec4 } from 'gl-matrix';
import { MeshData } from '../data/mesh';
import { ITexCoord } from '../data/TexCoords';
import { IVector3, Vector3 } from '../data/Vector3';
import { TriangleBuilder } from './triangle.builder';

export class QuadBuilder {
  private _offset = Vector3.of(0, 0, 0);

  set offset(offset: IVector3) {
    this._offset = offset;
    this.tris.offset = offset;
  }

  get offset(): IVector3 {
    return this._offset;
  }
  constructor(public readonly data: MeshData, public readonly tris: TriangleBuilder) {
  }

  append(v1: Array<number>, v2: Array<number>, v3: Array<number>, v4: Array<number>,
    color: vec4, textC: ITexCoord) {
    this.tris.append(
      v1, v2, v3, color, textC
    );
    this.tris.append(
      v1, v3, v4, color, textC
    );
  }

}
