/*jshint esversion: 6 */

// window.onload = main;
const canvas = new GLCanvas(document.getElementById("canvas"));
var gl = canvas.gl;
var program = new GLShaderUtils(canvas.gl)
  .initShaderProgramFromScript('2d-vertex-color-shader',
   '2d-fragment-vertexcolor-shader');

   const cubeB = new CubeBuilder(1);
   cubeB.frontFace([1.0,  1.0,  1.0,  1.0]);
   cubeB.backFace([1.0,  0.0,  0.0,  1.0]);
   cubeB.topFace([0.0,  1.0,  0.0,  1.0]);
   cubeB.bottomFace([0.0,  0.0,  1.0,  1.0]);
   cubeB.rightFace([1.0,  1.0,  0.0,  1.0]);
   cubeB.leftFace([1.0,  0.0,  1.0,  1.0]);
   console.log(cubeB);

const mesh = new GLMesh(gl, cubeB.points, cubeB.colors, cubeB.indices);

const buffer = mesh.createBuffers();
const camera = new GLCamera(gl);
// look up where the vertex data needs to go.
var programInfo = {
  program: program,
  position: gl.getAttribLocation(program, "aVertexPosition"),
  colors: gl.getAttribLocation(program, "aVertexColor"),
  color: gl.getUniformLocation(program, "u_color"),
  camera: gl.getUniformLocation(program, 'uProjectionMatrix'),
  worldView: gl.getUniformLocation(program, 'uModelViewMatrix')
};
const worldNode = new GLNode();
const node = new GLNode().appendTo(worldNode);
node.mesh = mesh;

// Actual drawing:
//
var squareRotation = 0;

function drawScene() {


  canvas.clearRect();

  worldNode.localTranslation[2] = -6.0;
  node.localTranslation[1] = 0.5;

  node.localRotation[2] = squareRotation;
  node.localRotation[1] = squareRotation * 0.7;

  worldNode.updateAll();
  worldNode.draw(gl, programInfo);
}

var then = 0;

function render(now) {
  now *= 0.001;  // convert to seconds
  const deltaTime = now - then;
  then = now;
  squareRotation += deltaTime;
  drawScene();
  requestAnimationFrame(render);
}
requestAnimationFrame(render);

// drawScene();

// continue at: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Creating_3D_objects_using_WebGL
