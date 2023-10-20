export class GLShaderUtils {
  constructor(public readonly gl: WebGLRenderingContext) {
  }

  initShaderProgramFromScript(vsId: string, fsId: string) {

    return this.initShaderProgram(
      (document.getElementById(vsId) as HTMLScriptElement).text,
      (document.getElementById(fsId) as HTMLScriptElement).text);
  }

  initShaderProgram(vsSource: string, fsSource: string): WebGLProgram {
    const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource) as WebGLShader;
    const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource) as WebGLShader;
    // Create the shader program
    const shaderProgram = this.gl.createProgram() as WebGLProgram;
    this.gl.attachShader(shaderProgram, vertexShader);
    this.gl.attachShader(shaderProgram, fragmentShader);
    this.gl.linkProgram(shaderProgram);
    // If creating the shader program failed, alert
    if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
      throw 'Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(shaderProgram);
    }
    return shaderProgram;
  }

  loadShader(type: number, source: string) {
    const shader = this.gl.createShader(type) as WebGLShader;
    // Send the source to the shader object
    this.gl.shaderSource(shader, source);
    // Compile the shader program
    this.gl.compileShader(shader);
    // See if it compiled successfully
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader), source);
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }
}
