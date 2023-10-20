#version 300 es

in vec4 aVertexPosition;
in vec3 a_texcoord;
in vec3 a_texcoord2;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uLightLevel;


out highp vec3 v_texcoord;
out highp vec3 v_texcoord2;
out vec3 fragLightLevel;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  v_texcoord = a_texcoord;
  v_texcoord2 = a_texcoord2;
  fragLightLevel = uLightLevel;
}
