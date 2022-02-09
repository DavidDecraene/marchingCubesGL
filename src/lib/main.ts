import { vec3 } from 'gl-matrix';
import { VoxelBuilder } from './builder/voxel.builder';
import { GLCamera } from './camera';
import { GLCanvas } from './canvas';
import { GLMesh } from './data/mesh';
import { GLNode } from './data/node';
import { TexCoords } from './data/TexCoords';
import { Texture } from './data/texture';
import { VoxelModel } from './data/voxel.model';
import { VoxelType } from './data/voxel.type';
import { GLShaderUtils } from './shader.utils';


export function main() {

  const canvas = new GLCanvas(document.getElementById("canvas") as HTMLCanvasElement);


  const gl = canvas.gl;
  /**
  let program = new GLShaderUtils(canvas.gl)
    .initShaderProgramFromScript('2d-vertex-color-shader',
     '2d-fragment-vertexcolor-shader') as WebGLProgram;*/

  let program2 = new GLShaderUtils(canvas.gl)
    .initShaderProgramFromScript('2d-vertex-color-texture-shader',
     '2d-fragment-vertexcolor-texture-shader') as WebGLProgram ;


  const voxelModel = new VoxelModel(vec3.fromValues(16, 16, 16));

  voxelModel.setVoxel(vec3.fromValues(0, 0, 0), { type: 1 });


  voxelModel.setVoxel(vec3.fromValues(0, 1, 0), { type: 1 });
  voxelModel.setVoxel(vec3.fromValues(1, 0, 0), { type: 1 });
  voxelModel.setVoxel(vec3.fromValues(0, -1, 0), { type: 1 });
  voxelModel.setVoxel(vec3.fromValues(-1, 0, 0), { type: 1 });
  voxelModel.setVoxel(vec3.fromValues(-2, 0, 0), { type: 1 });
  voxelModel.setVoxel(vec3.fromValues(-3, 0, 0), { type: 1 });
  voxelModel.setVoxel(vec3.fromValues(-3, -1, 0), { type: 1 });
  voxelModel.setVoxel(vec3.fromValues(-3, 0, -1), { type: 1 });
  voxelModel.setVoxel(vec3.fromValues(-3, 0, 1), { type: 1 });

  voxelModel.setVoxel(vec3.fromValues(0, 3, 0), { type: 1 });
  voxelModel.setVoxel(vec3.fromValues(0, -3, 0), { type: 1 });
  voxelModel.setVoxel(vec3.fromValues(0, -4, 0), { type: 1 });
  voxelModel.setVoxel(vec3.fromValues(1, -3, 0), { type: 1 });
  voxelModel.setVoxel(vec3.fromValues(1, -4, 0), { type: 1 });


  voxelModel.setVoxel(vec3.fromValues(3, 0, 0), { type: 1 });
  voxelModel.setVoxel(vec3.fromValues(4, 0, 0), { type: 1 });
  voxelModel.setVoxel(vec3.fromValues(3, 1, 0), { type: 1 });
  voxelModel.setVoxel(vec3.fromValues(4, 1, 0), { type: 1 });
  voxelModel.setVoxel(vec3.fromValues(3, 0, 1), { type: 1 });
  voxelModel.setVoxel(vec3.fromValues(4, 0, 1), { type: 1 });
  voxelModel.setVoxel(vec3.fromValues(4, 1, 1), { type: 1 });



  let currentMode = 1;
  let currentInset = 0.3;

  const texture = new Texture(gl, './CubeSides.png');
  const cubeType = new VoxelType(1, texture, [
    new TexCoords(0, 0, 1/3), // front
    new TexCoords(1/3, 0, 1/3),//back
    new TexCoords(2/3, 0, 1/3),//top
    new TexCoords(0, 1/3, 1/3),//bot
    new TexCoords(1/3, 1/3, 1/3),//right
    new TexCoords(2/3, 1/3, 1/3)//left
  ]);
  const mesh = new GLMesh(gl);
  function updateMesh(mode: number) {
    const voxelBuilder2 = new VoxelBuilder(voxelModel, cubeType);
    voxelBuilder2.mode = mode;
    voxelBuilder2.inset = currentInset;
    voxelModel.getSectors().forEach(sector => {
      sector.getVoxels().forEach(v => {
        voxelBuilder2.append(v as vec3);
      });
    });
    mesh.data = voxelBuilder2.data;
    mesh.createBuffers();
  }
  updateMesh(currentMode);
  const camera = new GLCamera(gl);
  const programToUse = program2;
  // look up where the vertex data needs to go.
  var programInfo = {
    program: programToUse,
    position: gl.getAttribLocation(programToUse, "aVertexPosition"),
    colors: gl.getAttribLocation(programToUse, "aVertexColor"),
    color: gl.getUniformLocation(programToUse, "u_color"),
    texture: gl.getUniformLocation(programToUse, "u_texture"),
    camera: gl.getUniformLocation(programToUse, 'uProjectionMatrix'),
    worldView: gl.getUniformLocation(programToUse, 'uModelViewMatrix'),
    uv: gl.getAttribLocation(programToUse, "a_texcoord"),
    glCamera: camera
  };
  const worldNode = new GLNode();
  const node = new GLNode().appendTo(worldNode);
  node.mesh = mesh;



  function toggleMode() {
    let n = 0;
    switch(currentMode) {
      case 1: n = 2; break;
      case 2: n = 0; break;
      case 0: n = 1; break;
    }
    currentMode = n;
    updateMesh(currentMode);
  }

  // Actual drawing:
  //
  let squareRotation = 0;
  let rotChange = 0.5;
  let tempRotation = vec3.fromValues(0, 0, 0);


  function drawScene() {

    canvas.clearRect();

    worldNode.localTranslation[2] = -9.0;
    node.localTranslation[1] = 0.5;

    node.localRotation = tempRotation;
    if (squareRotation) {
      node.localRotation[2] = squareRotation;
      node.localRotation[1] = squareRotation * 0.7;
    }

    worldNode.updateAll();
    worldNode.draw(gl, programInfo);
  }

  let then = 0;

  function render(now: number) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;
    squareRotation += deltaTime *  rotChange;
    drawScene();
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

}
