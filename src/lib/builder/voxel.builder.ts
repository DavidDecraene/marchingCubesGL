import { MeshData } from "../data/mesh";
import { VoxelModel } from "../data/voxels/voxel.model";
import { VoxelState } from "../data/voxels/voxel.state";
import { QuadBuilder } from "./quad.builder";
import { TriangleBuilder } from "./triangle.builder";
import { vec4 } from 'gl-matrix';
import { Quad } from "../data/Quad";
import { Triangle } from "../data/Triangle";
import { BitFlag } from "wombat-math";
import { Faces, FaceType} from '../constants/states';
import { PlainFaceBuilder } from "./plain.face.builder";
import { BeveledFaceBuilder } from "./beveled.face.builder";
import { IVector3, Vector3 } from "../data/Vector3";
import { IVoxel } from "../data/voxels/voxel";
import { VoxelTypes } from "../data/voxels/voxel.types";
import { AOCalculater } from "./ambient.occlussion";

export class VoxelBuilder {
  public mode = 1; // beveled cube, only indented corners
  //this.mode = 2; // beveled cube,  indented corners an borders
  public data = new MeshData();
  public unitSize = 0.5;
  private aoCalculation = new AOCalculater();
  public tris = new TriangleBuilder(this.data, v => {
    const ao = this.aoCalculation.calculateOcclusion(v);
    const light = this.aoCalculation.getLightLevel() / 15;
    //const light = this.aoCalculation.state?.vector
    return Vector3.of(ao / 3, light, 1);
  });
  public quads = new QuadBuilder(this.data, this.tris);
  public inset = 0.1;

  private plainFaceBuilder = new PlainFaceBuilder(this);
  private beveledFaceBuilder = new BeveledFaceBuilder(this);

  constructor(public readonly model: VoxelModel,
    public readonly voxelTypes: VoxelTypes) {

  }

  public append(vector: IVector3, voxel: IVoxel) {
    if(!voxel) return;
    const voxelType = this.voxelTypes.getType(voxel.type);
    if(!voxelType) return;
    const state = new VoxelState(vector, this.model, voxelType);
    if (state.flag === 63) { return; }
    this.aoCalculation.state = state;
    this.quads.offset = vector;
    this.buildFront(state);
    this.buildBack(state);
    this.buildTop(state);
    this.buildBottom(state);
    this.buildRight(state);
    this.buildLeft(state);
  }

  private appendQuad(side: number, quad: Quad, state: VoxelState) {
    const texCoord = state.voxelType.texCoords[side];
    const color = state.voxelType.colors[side] as vec4;
    // the face == side


    quad.appendTo(this.quads, color, texCoord);
  }

  private appendTriangle(side: number, tri: Triangle, state: VoxelState) {
    const texCoord = state.voxelType.texCoords[side];
    const color = state.voxelType.colors[side] as vec4;

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
      this.aoCalculation.side = type.side;
      if(BitFlag.isSet(state.flag, type.flag)) return;
      let flag = 0;
      type.flanks.forEach((v, i) => {
        if (BitFlag.isSet(state.flag, 1 << v)) {
          flag =  BitFlag.set(flag, 1 << i);
        }
      });
      this.buildQuads(flag, type.side, q => {
        this.appendQuad(type.side, quad(q), state);
      }, t => {
        this.appendTriangle(type.side, tri(t), state);
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
