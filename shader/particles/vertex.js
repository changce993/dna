export default `
  uniform float time;
  uniform sampler2D texture1;

  varying vec2 vUv;
  varying vec3 vPosition;
  varying float vColorRandom;

  attribute float randoms;
  attribute float colorRandoms;

  float PI = 3.141629;

  void main() {
    vUv = uv;
    vColorRandom = colorRandoms;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (30.0 * randoms + 10.0) * (1.0 / - mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`