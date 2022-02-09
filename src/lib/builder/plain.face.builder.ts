import { Quad } from "../data/Quad";
import { Triangle } from "../data/Triangle";
import { VoxelBuilder } from "./voxel.builder";

export class PlainFaceBuilder {

  constructor(private builder: VoxelBuilder){

  }
  
  public build(
    _flag: number,
    _side: number,
    quad: (q: Quad) => void,
    _tri: (t: Triangle) => void) {
    const middle = new Quad(this.builder.unitSize);
    quad(middle);
  }
}
