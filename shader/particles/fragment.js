export default `
  uniform float time;
  uniform float progress;
  uniform sampler2D texture1;
  uniform vec4 resolution;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;

  varying vec2 vUv;
  varying vec3 vPosition;
  varying float vColorRandom;

  float PI = 3.141629;

  void main() {
    float alpha = 1.0 - smoothstep(-0.2, 0.5, length(gl_PointCoord - vec2(0.5)));

    vec3 finalColor = uColor1;
    if(vColorRandom > 0.33 && vColorRandom < 0.66) {
      finalColor = uColor2;
    }
    if(vColorRandom >  0.66) {
      finalColor = uColor3;
    }

    float gradient = smoothstep(0.1, 0.3, vUv.y);
    gl_FragColor = vec4(finalColor, alpha*gradient);
  }
`