/*jshint esversion: 6 */
class GLShaderUtils {
  constructor(gl) {
    this.gl = gl;
  }

  initShaderProgramFromScript(vsId, fsId) {
    return this.initShaderProgram(
      document.getElementById(vsId).text,
      document.getElementById(fsId).text);
  }

  initShaderProgram(vsSource, fsSource) {

    const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);
    // Create the shader program
    const shaderProgram = this.gl.createProgram();
    this.gl.attachShader(shaderProgram, vertexShader);
    this.gl.attachShader(shaderProgram, fragmentShader);
    this.gl.linkProgram(shaderProgram);
    // If creating the shader program failed, alert
    if (!this.gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(shaderProgram));
      return null;
    }
    return shaderProgram;
  }

  loadShader(type, source) {
    const shader = this.gl.createShader(type);
    // Send the source to the shader object
    this.gl.shaderSource(shader, source);
    // Compile the shader program
    this.gl.compileShader(shader);
    // See if it compiled successfully
    if (!this.gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }
}
