#version 300 es
precision highp float;
in highp vec3 v_texcoord;
in highp vec3 v_texcoord2;
in highp vec3 fragLightLevel;
out vec4 fragColor;
uniform highp sampler2DArray u_texture;

void main() {
 vec4 color = texture(u_texture, v_texcoord);

   float lightStrength = v_texcoord2.x * v_texcoord2.y;

   vec4 baseColor = color * lightStrength;

   if(color.w < 0.1)
        discard;
   fragColor = vec4(baseColor.xyz * fragLightLevel, color.w);

   // try gl_FragColor.xyz *= gl_FragColor.w;
}
