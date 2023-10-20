
attribute vec4 aVertexPosition;
attribute vec2 a_texcoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;


varying lowp vec2 v_texcoord;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  v_texcoord = a_texcoord;
}
