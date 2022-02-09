import { MeshData } from "../data/mesh";
import { VoxelModel } from "../data/voxel.model";
import { VoxelState } from "../voxel.state";
import { QuadBuilder } from "./quad.builder";
import { TriangleBuilder } from "./triangle.builder";
import { vec3, vec4 } from 'gl-matrix';
import { Quad } from "../data/Quad";
import { Triangle } from "../data/Triangle";
import { BitFlags } from "../utils/BitFlag";
import { VoxelType } from "../data/voxel.type";
import { Faces, FaceType} from '../constants/states';
import { PlainFaceBuilder } from "./plain.face.builder";
import { BeveledFaceBuilder } from "./beveled.face.builder";

export class VoxelBuilder {
  public mode = 1; // beveled cube, only indented corners
  //this.mode = 2; // beveled cube,  indented corners an borders
  public data = new MeshData();
  public unitSize = 0.5;
  public tris = new TriangleBuilder(this.data);
  public quads = new QuadBuilder(this.data, this.tris);
  public inset = 0.1;

  private plainFaceBuilder = new PlainFaceBuilder(this);
  private beveledFaceBuilder = new BeveledFaceBuilder(this);

  constructor(public readonly model: VoxelModel, public voxelType: VoxelType) {

  }

  public append(vector: vec3) {
    const state = new VoxelState(vector, this.model);
    if (!state.voxel) return;
    if (state.flag === 63) { return; }
    this.quads.offset = vector;
    this.buildFront(state);
    this.buildBack(state);
    this.buildTop(state);
    this.buildBottom(state);
    this.buildRight(state);
    this.buildLeft(state);
  }

  appendQuad(side: number, quad: Quad) {
    const texCoord = this.voxelType.texCoords[side];
    const color = this.voxelType.colors[side] as vec4;

    quad.appendTo(this.quads, color, texCoord);
  }

  appendTriangle(side: number, tri: Triangle) {
    const texCoord = this.voxelType.texCoords[side];
    const color = this.voxelType.colors[side] as vec4;

    tri.appendTo(this.tris, color, texCoord);
  }

// flag: top(1) bot(1) right(4) left(8)
  private buildQuads(flag: number, side: number,
    quad: (q: Quad) => void,
    tri: (t: Triangle) => void) {
    switch(this.mode){
      case 0: this.plainFaceBuilder.build(flag, side, quad, tri); break;
      case 1: this.beveledFaceBuilder.build(flag, side, quad, tri); break;
    }
  }

  private buildFace(type: FaceType, state: VoxelState,
    quad: (q: Quad) => Quad,
    tri: (t: Triangle) => Triangle) {
      if (state.sides[type.side]) {
        return;
      }
      let flag = 0;
      type.flanks.forEach((v, i) => {
        if (BitFlags.isSet(state.flag, 1 << v)) {
          flag =  BitFlags.set(flag, 1 << i);
        }
      });
      this.buildQuads(flag, type.side, q => {
        this.appendQuad(type.side, quad(q));
      }, t => {
        this.appendTriangle(type.side, tri(t));
      });
  }

  buildFront(state: VoxelState) {
    this.buildFace(Faces.FRONT, state,
    q => q,
    t => t);
  }

  buildBack(state: VoxelState) {
        this.buildFace(Faces.BACK, state,
        q => q.back(),
        t => t.back());
  }

  buildTop(state: VoxelState) {
        this.buildFace(Faces.TOP, state,
        q => q.top(),
        t => t.top());
  }

  buildBottom(state: VoxelState) {
        this.buildFace(Faces.BOTTOM, state,
        q => q.bottom(),
        t => t.bottom());
  }

  buildRight(state: VoxelState) {
        this.buildFace(Faces.RIGHT, state,
        q => q.right(),
        t => t.right());
  }

  buildLeft(state: VoxelState) {
        this.buildFace(Faces.LEFT, state,
        q => q.left(),
        t => t.left());
  }


}
