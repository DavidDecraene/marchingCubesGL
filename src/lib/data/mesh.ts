import { vec4 } from 'gl-matrix';
import { Material } from './Material';
import { IVector3 } from './Vector3';

export class MeshData {
  public readonly uv: Array<number> = [];
  public readonly uv2: Array<number> = [];
  public readonly points: Array<number> = [];
  public readonly colors: Array<number> = [];
  public readonly normals: Array<number> = [];
  public readonly indices: Array<number> = [];
  constructor() {
  }

  public addLighting(v: IVector3): void {
    this.uv2.push(v.x);
    this.uv2.push(v.y);
    this.uv2.push(v.z);
  }

  public addPoint(v: IVector3): void {
    this.points.push(v.x);
    this.points.push(v.y);
    this.points.push(v.z);
  }

  public addNormal(v: IVector3): void {
    this.normals.push(v.x);
    this.normals.push(v.y);
    this.normals.push(v.z);
  }

  public addColor(color: vec4): void {
    this.colors.push(color[0]);
    this.colors.push(color[1]);
    this.colors.push(color[2]);
    this.colors.push(color[3]);
  }

  public addUV(v: IVector3): void {
    this.uv.push(v.x);
    this.uv.push(v.y);
    this.uv.push(v.z);
  }



}

interface MeshBuffers {
  position?: WebGLBuffer;
  uv?: WebGLBuffer;
  uv2?: WebGLBuffer;
  indices?: WebGLBuffer;
  colors?: WebGLBuffer;
}

export class GLMesh {
  public material: Material | undefined;

  public get positionBuffer(): WebGLBuffer {
    if (!this.buffers.position) throw "no position buffer available";
    return this.buffers.position;
  }

  public get uvBuffer(): WebGLBuffer {
    if (!this.buffers.uv) throw "no uv buffer available";
    return this.buffers.uv;
  }

  public get uvBuffer2(): WebGLBuffer {
    if (!this.buffers.uv2) throw "no uv buffer2 available";
    return this.buffers.uv2;
  }

  public get indexBuffer(): WebGLBuffer {
    if (!this.buffers.indices) throw "no buffer available";
    return this.buffers.indices;
  }

  public get colorBuffer(): WebGLBuffer {
    if (!this.buffers.colors) throw "no buffer available";
    return this.buffers.colors;
  }

  public get indexLength(): number {
    return this.data.indices.length;
  }

  private buffers: MeshBuffers = {};
  constructor(public readonly gl: WebGL2RenderingContext, public data = new MeshData()) {
  }

  createBuffers() {
    const uvBuffer = this.gl.createBuffer();
    if (!uvBuffer) throw "Couldnt create buffer";
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, uvBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(this.data.uv),
      this.gl.STATIC_DRAW);

    const uvBuffer2 = this.gl.createBuffer();
    if (!uvBuffer2) throw "Couldnt create buffer";
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, uvBuffer2);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(this.data.uv2),
      this.gl.STATIC_DRAW);

    const posBuffer = this.gl.createBuffer();
    if (!posBuffer) throw "Couldnt create buffer";
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(this.data.points),
      this.gl.STATIC_DRAW);
    const colBuffer = this.gl.createBuffer();
    if (!colBuffer) throw "Couldnt create buffer";
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(this.data.colors),
      this.gl.STATIC_DRAW);
    const indexBuffer = this.gl.createBuffer();
    if (!indexBuffer) throw "Couldnt create buffer";
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(this.data.indices), this.gl.STATIC_DRAW);
    this.buffers = {
      position: posBuffer,
      colors: colBuffer,
      indices: indexBuffer,
      uv: uvBuffer,
      uv2: uvBuffer2
    };
    return this.buffers;
  }
}
