import { vec3, mat4, quat2 } from 'gl-matrix';
import { GLMesh } from './mesh';

export class GLNode {
  public localTranslation = vec3.fromValues(0, 0, 0);
  public localRotation = vec3.fromValues(0, 0, 0);
  public localScale = vec3.fromValues(1, 1, 1);
  public localMatrix = mat4.create();
  public worldMatrix = mat4.create();
  public children: Array<GLNode> = [];

  public mesh: GLMesh | undefined;
  public parent: GLNode | undefined;

  constructor() {
  }


  draw(gl: WebGLRenderingContext, programInfo: any) {
    this.children.forEach(child => {
      child.draw(gl, programInfo);
    });
    if (this.mesh) {
      gl.useProgram(programInfo.program);

      gl.uniformMatrix4fv(
           programInfo.camera,
           false,
           programInfo.glCamera.projectionMatrix);
       gl.uniformMatrix4fv(
           programInfo.worldView,
           false,
           this.worldMatrix);

      this.mesh.drawBuffers(programInfo);
    }
  }

  appendTo(parent: GLNode) {
    if (this.parent === parent) return this;
    if (this.parent) {
      const idx = this.parent.children.findIndex(e => e === this);
      if(idx >= 0) this.parent.children.splice(idx, 1);
    }
    this.parent = parent;
    this.parent.children.push(this);
    return this;
  }

  updateLocalMatrix() {
    const quat = quat2.create();
    if (this.localRotation[0]) {
      quat2.rotateX(quat, quat, this.localRotation[0]);
    }
    if (this.localRotation[1]) {
      quat2.rotateY(quat, quat, this.localRotation[1]);
    }
    if (this.localRotation[2]) {
      quat2.rotateZ(quat, quat, this.localRotation[2]);
    }
    // mat4.fromTranslation(this.localMatrix, this.localTranslation);
    mat4.fromRotationTranslationScale(this.localMatrix, quat, this.localTranslation, this.localScale);
  }

  updateWorldMatrix() {
    if (!this.parent) {
      mat4.copy(this.worldMatrix, this.localMatrix);
      return;
    }
    mat4.multiply(this.worldMatrix, this.parent.worldMatrix, this.localMatrix);
  }

  updateMatrices() {
    this.updateLocalMatrix();
    this.updateWorldMatrix();
  }

  updateAll() {
    this.updateMatrices();
    this.children.forEach(c => c.updateAll());
  }

}
