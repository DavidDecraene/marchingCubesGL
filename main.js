/*jshint esversion: 6 */

// window.onload = main;
const canvas = new GLCanvas(document.getElementById("canvas"));



var gl = canvas.gl;
var program = new GLShaderUtils(canvas.gl)
  .initShaderProgramFromScript('2d-vertex-color-shader',
   '2d-fragment-vertexcolor-shader');
const texture = new Texture(gl, './assets/CubeSides.png');

var program2 = new GLShaderUtils(canvas.gl)
  .initShaderProgramFromScript('2d-vertex-color-texture-shader',
   '2d-fragment-vertexcolor-texture-shader');


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

const lModel = new VoxelSet();
lModel.setVoxel(vec3.fromValues(0, 0, 0), { type: 1 });
lModel.setVoxel(vec3.fromValues(1, 0, 0), { type: 1 });
lModel.setVoxel(vec3.fromValues(-1, 0, 0), { type: 1 });
lModel.setVoxel(vec3.fromValues(1, 1, 0), { type: 1 });
lModel.setVoxel(vec3.fromValues(-1, -1, 0), { type: 1 });
lModel.translate(5, 3);
lModel.appendTo(voxelModel);

var currentMode = 2; //2;
var currentInset = 0.3;

var textureMap = [
  [0, 0, 1/3], [1/3, 0, 1/3], [2/3, 0, 1/3], // x, y, w & h
  [0, 1/3, 1/3], [1/3, 1/3, 1/3], [2/3, 1/3, 1/3]
];

const voxelBuilder = new VoxelBuilder(voxelModel, textureMap);
voxelBuilder.mode = currentMode;
voxelBuilder.inset = currentInset;
voxelModel.getSectors().forEach(sector => {
  sector.getVoxels().forEach(v => voxelBuilder.append(v));
});
const mesh = new GLMesh(gl, voxelBuilder.data);

mesh.createBuffers();
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
  uv: gl.getAttribLocation(programToUse, "a_texcoord")
};
const worldNode = new GLNode();
const node = new GLNode().appendTo(worldNode);
node.mesh = mesh;


function updateMesh(mode) {
  const voxelBuilder2 = new VoxelBuilder(voxelModel, textureMap);
  voxelBuilder2.mode = mode;
  voxelBuilder2.inset = currentInset;
  voxelModel.getSectors().forEach(sector => {
    sector.getVoxels().forEach(v => voxelBuilder2.append(v));
  });
  mesh.data = voxelBuilder2.data;
  mesh.createBuffers();
}

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
var squareRotation = 0;
var rotChange = 0.5;
var tempRotation = [0, 0, 0];

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

var then = 0;

function render(now) {
  now *= 0.001;  // convert to seconds
  const deltaTime = now - then;
  then = now;
  squareRotation += deltaTime *  rotChange;
  drawScene();
  requestAnimationFrame(render);
}
requestAnimationFrame(render);

// drawScene();

// continue at: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Creating_3D_objects_using_WebGL
