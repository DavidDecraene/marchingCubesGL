
import { vec3, mat4 } from 'gl-matrix';
import { IVector2 } from '../Vector2';

export class Ray {
  public start = vec3.create();
  public end  = vec3.create();

  public update(clipSp: IVector2, inverseViewProjectionMatrix: mat4): void {
    //https://webglfundamentals.org/webgl/lessons/webgl-qna-how-to-get-the-3d-coordinates-of-a-mouse-click.html
    this.start = vec3.transformMat4(this.start, [clipSp.x, clipSp.y, -1], inverseViewProjectionMatrix);
    this.end = vec3.transformMat4(this.end, [clipSp.x, clipSp.y, 1], inverseViewProjectionMatrix);
  }

}
