import { mat4, quat2 } from 'gl-matrix';
import { Subject } from 'rxjs';
import { GLMesh } from './mesh';
import { RenderContext } from './RenderContext';
import {  ObservableVector3 } from './Vector3';

export class GLNode {
  public readonly localTranslation = new ObservableVector3(0, 0, 0);
  public readonly localRotation = new ObservableVector3(0, 0, 0);
  public readonly localScale = new ObservableVector3(1, 1, 1);
  public localMatrix = mat4.create();
  public worldMatrix = mat4.create();
  public children: Array<GLNode> = [];

  public mesh: GLMesh | undefined;
  public parent: GLNode | undefined;

  public onWorldMatrixChange = new Subject<mat4>();

  constructor() {
  }


  draw(context: RenderContext) {
    this.children.forEach(child => {
      child.draw(context);
    });
    if (this.mesh && this.mesh.material) {
      this.mesh.material.renderMesh(this, this.mesh, context);
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

  updateMatrices() {
    const rotChange = this.localRotation.consume();
    const tChange = this.localTranslation.consume();
    if(!this.localScale.consume() && !rotChange && !tChange) {
      return;
    }

    const quat = quat2.create();
    if (this.localRotation.x) {
      quat2.rotateX(quat, quat, this.localRotation.x);
    }
    if (this.localRotation.y) {
      quat2.rotateY(quat, quat, this.localRotation.y);
    }
    if (this.localRotation.z) {
      quat2.rotateZ(quat, quat, this.localRotation.z);
    }
    // mat4.fromTranslation(this.localMatrix, this.localTranslation);
    mat4.fromRotationTranslationScale(this.localMatrix, quat,
      this.localTranslation.vec3(),
      this.localScale.vec3());

    if (!this.parent) {
      mat4.copy(this.worldMatrix, this.localMatrix);
      this.onWorldMatrixChange.next(this.worldMatrix);
      return;
    }
    mat4.multiply(this.worldMatrix, this.parent.worldMatrix, this.localMatrix);
    this.onWorldMatrixChange.next(this.worldMatrix);
  }

  updateAll() {
    this.updateMatrices();
    this.children.forEach(c => c.updateAll());
  }

}

export class RootNode extends GLNode {

}
