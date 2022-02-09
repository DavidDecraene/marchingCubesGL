

export class GLCanvas {
  public get height() {
    return this.canvas.height;
  }

  public get width() {
    return this.canvas.width;
  }

  public readonly gl: WebGLRenderingContext;

  constructor(public readonly canvas: HTMLCanvasElement) {
    this.gl = canvas.getContext("webgl") as WebGLRenderingContext;
  }

  public clearRect() {
    // Set clear color to black, fully opaque
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clearDepth(1.0);                 // Clear everything
    this.gl.enable(this.gl.DEPTH_TEST);           // Enable depth testing
    this.gl.depthFunc(this.gl.LEQUAL);            // Near things obscure far things
    // Clear the color buffer with specified clear color
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    //gl.enable(gl.CULL_FACE);
  }



}
