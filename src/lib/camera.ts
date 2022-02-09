import { mat4 } from 'gl-matrix';

export class GLCamera {
  public projectionMatrix: mat4;
  public readonly fieldOfView = 45 * Math.PI / 180;
  public readonly aspect: number;
  public readonly zNear: number;
  public readonly zFar: number;

  public static MAIN: GLCamera | undefined;


  constructor(public readonly gl: WebGLRenderingContext) {
    GLCamera.MAIN = this;
  // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.
    this.gl = gl;
    this.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    this.zNear = 0.1;
    this.zFar = 100.0;
    this.projectionMatrix = mat4.create();
    this.buildMatrix();

  }

  buildMatrix() {
    mat4.perspective(this.projectionMatrix,
                     this.fieldOfView,
                     this.aspect,
                     this.zNear,
                     this.zFar);
  }
}
