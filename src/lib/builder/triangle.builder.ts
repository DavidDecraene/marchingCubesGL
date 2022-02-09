import { MeshData } from "../data/mesh";
import { vec3, vec4 } from 'gl-matrix';
import { TexCoords } from "../data/TexCoords";

export class TriangleBuilder {
  public offset = vec3.fromValues(0, 0, 0);
  constructor(public readonly data: MeshData) {
    this.data = data;
  }

  addVertex(v: vec3, t1: number, t2: number, textC: TexCoords) {
    this.data.points.push(v[0]);
    this.data.points.push(v[1]);
    this.data.points.push(v[2]);
    this.data.addUV(textC.map({x: t1, y: t2 }));
  }

  append(v1: Array<number>, v2: Array<number>, v3: Array<number>, color: vec4,
    textC: TexCoords) {
    const start = this.data.points.length / 3;
    this.data.indices.push(start);
    this.data.indices.push(start + 1);
    this.data.indices.push(start + 2);
    for(let i = 0; i < 3 ; i++) {
      this.data.addColor(color);
    }
    const v1O = vec3.add(vec3.fromValues(0, 0, 0), v1 as vec3, this.offset);
    const v2O = vec3.add(vec3.fromValues(0, 0, 0), v2 as vec3, this.offset);
    const v3O = vec3.add(vec3.fromValues(0, 0, 0), v3 as vec3, this.offset);
    this.addVertex(v1O, v1[3], v1[4], textC);
    this.addVertex(v2O, v2[3], v2[4], textC);
    this.addVertex(v3O, v3[3], v3[4], textC);
    const edge1 = vec3.subtract(vec3.fromValues(0, 0, 0), v2O, v1O);
    const edge2 = vec3.subtract(vec3.fromValues(0, 0, 0), v3O, v1O);
    const normal = vec3.cross(vec3.fromValues(0, 0, 0), edge1, edge2);
    vec3.normalize(normal, normal);
    this.data.normals.push(normal);
    this.data.normals.push(normal);
    this.data.normals.push(normal);
  }

}
