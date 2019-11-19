/*jshint esversion: 6 */

class GLCamera {
  constructor(gl) {
  // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.
    this.gl = gl;
    this.fieldOfView = 45 * Math.PI / 180;   // in radians
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
