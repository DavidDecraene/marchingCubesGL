/*jshint esversion: 6 */

class GLCanvas {
  get height() {
    return this.canvas.height;
  }
  get width() {
    return this.canvas.width;

  }
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl");
  }

  clearRect() {
    // Set clear color to black, fully opaque
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    // Clear the color buffer with specified clear color
    this.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //gl.enable(gl.CULL_FACE);
  }


}
