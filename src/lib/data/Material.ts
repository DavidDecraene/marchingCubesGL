import { GLMesh } from "./mesh";
import { GLNode } from "./node";
import { RenderContext } from "./RenderContext";


export class Material {
  constructor(protected readonly shader: WebGLProgram){

  }

  public renderMesh(_node: GLNode, _mesh: GLMesh,
      _context: RenderContext): void {

  }
}
