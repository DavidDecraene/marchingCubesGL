import { MeshData } from "../data/mesh";
import { vec4 } from 'gl-matrix';
import { ITexCoord } from "../data/TexCoords";
import { IVector3, Vector3 } from "../data/Vector3";



// ao, lightlevel, ..
export type LightingModel = (vec: IVector3) => IVector3;


export class TriangleBuilder {
  public offset = Vector3.of(0, 0, 0);
  constructor(public readonly data: MeshData,
    public readonly lightModel: LightingModel) {
    this.data = data;
  }

  addVertex(v: IVector3, t1: number, t2: number, textC: ITexCoord,
    lighting: IVector3) {
    this.data.addPoint(v);
    this.data.addUV(textC.map({x: t1, y: t2 }));
    this.data.addLighting(lighting);
  }

  append(v1: Array<number>, v2: Array<number>, v3: Array<number>, color: vec4,
    textC: ITexCoord) {
    const start = this.data.points.length / 3;
    this.data.indices.push(start);
    this.data.indices.push(start + 1);
    this.data.indices.push(start + 2);
    for(let i = 0; i < 3 ; i++) {
      this.data.addColor(color);
    }
    const v31 = Vector3.from(v1);
    const v32 = Vector3.from(v2);
    const v33 = Vector3.from(v3);
    const v1O = Vector3.add(v31, this.offset);
    const v2O = Vector3.add(v32, this.offset);
    const v3O = Vector3.add(v33, this.offset);
    // calculate ambient occlusion from vector relative to offset:
    // need the face and need to find the vertex like orientation
    this.addVertex(v1O, v1[3], v1[4], textC, this.lightModel(v31));
    this.addVertex(v2O, v2[3], v2[4], textC, this.lightModel(v32));
    this.addVertex(v3O, v3[3], v3[4], textC, this.lightModel(v33));
    const edge1 = Vector3.subtract(v2O, v1O);
    const edge2 = Vector3.subtract(v3O, v1O);
    const normal = Vector3.cross(edge1, edge2);
    Vector3.normalize(normal);
    this.data.addNormal(normal);
    this.data.addNormal(normal);
    this.data.addNormal(normal);
  }

}
