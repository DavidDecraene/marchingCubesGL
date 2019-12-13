/*jshint esversion: 6 */

class MeshData {
  constructor() {
    this.points = [];
    this.colors = [];
    this.indices = [];
    this.normals = [];
    this.uv = [];
  }

}

class GLMesh {
  constructor(gl, meshData) {
    this.gl = gl;
    this.data = meshData;
  }

  createBuffers() {
    const uvBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, uvBuffer);
    this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array(this.data.uv),
        this.gl.STATIC_DRAW);

    const posBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuffer);
    this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array(this.data.points),
        this.gl.STATIC_DRAW);
    const colBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colBuffer);
    this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array(this.data.colors),
        this.gl.STATIC_DRAW);
    const indexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(this.data.indices), this.gl.STATIC_DRAW);
    this.buffers = {
      position: posBuffer,
      colors: colBuffer,
      indices: indexBuffer,
      uv: uvBuffer
    };
    return this.buffers;
  }

  drawBuffers(programInfo) {
    if (!this.xx)  { console.log(this.data.uv); this.xx = true; }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.uv);
    this.gl.vertexAttribPointer(programInfo.uv, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(programInfo.uv);


    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
    this.gl.vertexAttribPointer(programInfo.position, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(programInfo.position);


      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.colors);
        this.gl.vertexAttribPointer(programInfo.colors, 4, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(programInfo.colors);
    // Tell WebGL which indices to use to index the vertices

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
    // this.gl.uniform4f(programInfo.color, Math.random(), Math.random(), Math.random(), 1);
    // draw
    // gl.drawArrays(gl.TRIANGLES, 0, 6);

    this.gl.uniform1i(programInfo.texture, 0);
    this.gl.drawElements(this.gl.TRIANGLES, this.data.indices.length, this.gl.UNSIGNED_SHORT, 0);
    // this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

  }
}
