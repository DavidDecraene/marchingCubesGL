import { Material } from "../data/Material";
import { GLMesh } from "../data/mesh";
import { GLNode } from "../data/node";
import { RenderContext } from "../data/RenderContext";
import { Texture } from "../data/texture";


export class CubeSideMaterial extends Material {

  private position = 0;
  //private colors = 0;
  private camera: WebGLUniformLocation;
  private worldView: WebGLUniformLocation;
  private sampler: WebGLUniformLocation;
  private uv = 0;


  constructor(shader: WebGLProgram,
    gl: WebGL2RenderingContext,
    private readonly texture: Texture) {
    super(shader);
    this.position = gl.getAttribLocation(shader, "aVertexPosition");
    //  this.colors = gl.getAttribLocation(shader, "aVertexColor") ;
    this.camera = gl.getUniformLocation(shader, 'uProjectionMatrix') as WebGLUniformLocation;
    this.worldView = gl.getUniformLocation(shader, 'uModelViewMatrix') as WebGLUniformLocation;
    this.uv = gl.getAttribLocation(shader, "a_texcoord");
    this.sampler = gl.getUniformLocation(shader, 'u_texture') as WebGLUniformLocation;
  }

  public renderMesh(node: GLNode, mesh: GLMesh,
      context: RenderContext): void {
    const { gl } = context;
    gl.useProgram(this.shader);

    gl.uniformMatrix4fv(
         this.camera,
         false,
         context.camera.projectionMatrix);
     gl.uniformMatrix4fv(
         this.worldView,
         false,
         node.worldMatrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture.texture);
    gl.uniform1i(this.sampler, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.uvBuffer);
    gl.vertexAttribPointer(this.uv, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.uv);

    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.positionBuffer);
    gl.vertexAttribPointer(this.position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.position);

/**
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.colorBuffer);
    gl.vertexAttribPointer(this.colors, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.colors); */

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
    gl.drawElements(gl.TRIANGLES, mesh.indexLength, gl.UNSIGNED_SHORT, 0);

  }

}
