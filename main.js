import './style.scss'
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass"
import vertex from "./shader/particles/vertex"
import fragment from "./shader/particles/fragment"
import GUI from 'lil-gui'

function getViewport() {
  const width = window.innerWidth
  const height = window.innerHeight
  const aspect = width / height

  return { width, height, aspect }
}

const gui = new GUI()
gui.close()

let mesh;
const canvas = document.querySelector("canvas#webgl")
const camera = new THREE.PerspectiveCamera(70, getViewport().aspect, 0.001, 1000)
const scene = new THREE.Scene()
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true })
const loader = new GLTFLoader()
const dracoLoader = new DRACOLoader()
const controls = new OrbitControls(camera, renderer.domElement)
const params = { play: true }

dracoLoader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/');
loader.setDRACOLoader(dracoLoader)

renderer.setSize(getViewport().width, getViewport().height)
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setClearColor(0x000000, 1)
renderer.physicallyCorrectLights = true

const renderScene = new RenderPass(scene, camera)
const bloomPass = new UnrealBloomPass(new THREE.Vector2(getViewport().width, getViewport().height), 0.1, 0, 0)
const composer = new EffectComposer(renderer)

composer.addPass(renderScene)
composer.addPass(bloomPass)

const bloomFolder = gui.addFolder('BloomPass')
bloomFolder.add(bloomPass, 'strength').name('strength').min(-1).max(1)
bloomFolder.add(bloomPass, 'radius').name('radius').min(-1).max(1)
bloomFolder.add(bloomPass, 'threshold').name('threshold').min(-1).max(1)

const cameraFolderPosition = gui.addFolder('Camera Position')
cameraFolderPosition.add(camera.position, 'x').name('x').min(-5).max(5)
cameraFolderPosition.add(camera.position, 'y').name('y').min(-3).max(15)
cameraFolderPosition.add(camera.position, 'z').name('z').min(-1).max(10)

const cameraFolderRotation = gui.addFolder('Camera Rotation')
cameraFolderRotation.add(camera.rotation, 'x').name('x').min(-1).max(2)
cameraFolderRotation.add(camera.rotation, 'y').name('y').min(-1).max(2)
cameraFolderRotation.add(camera.rotation, 'z').name('z').min(-Math.PI/2).max(Math.PI/2)

controls.enableDamping = true
camera.position.z = 1.8

loader.load("./dna.glb", gltf => {
  const geometry = gltf.scene.children[0].geometry
  geometry.center()

  const number = geometry.attributes.position.array.length

  const randoms = new Float32Array(number/3)
  const colorRandoms = new Float32Array(number/3)

  for(let i = 0; i < number/3; i++) {
    randoms.set([Math.random()], i)
    colorRandoms.set([Math.random()], i)
  }

  geometry.setAttribute("randoms", new THREE.BufferAttribute(randoms, 1))
  geometry.setAttribute("colorRandoms", new THREE.BufferAttribute(colorRandoms, 1))

  const material = new THREE.ShaderMaterial({
    extension: "#extension GL_OES_standard_derivatives : enable",
    side: THREE.DoubleSide,
    uniforms: {
      time: { value: 0 },
      resolution: { value: new THREE.Vector4() },
      uColor1: { value: new THREE.Color(0x11ca83) },
      uColor2: { value: new THREE.Color(0x1F2825) },
      uColor3: { value: new THREE.Color(0x1F2825) },
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: vertex,
    fragmentShader: fragment,
  })

  mesh = new THREE.Points(geometry, material)
  mesh.scale.x = 1.2
  mesh.position.y = 5

  const color = gui.addFolder('Particle colors')
  color.addColor(mesh.material.uniforms.uColor1, 'value').name('Color1')
  color.addColor(mesh.material.uniforms.uColor2, 'value').name('Color2')
  color.addColor(mesh.material.uniforms.uColor3, 'value').name('Color3')

  const DNAFolderPosition = gui.addFolder('DNA Position')
  DNAFolderPosition.add(camera.position, 'x').name('x').min(-2).max(2)
  DNAFolderPosition.add(camera.position, 'y').name('y').min(-3).max(15)
  DNAFolderPosition.add(camera.position, 'z').name('z').min(-1).max(10)

  gui.add(params, 'play').name('Play')

  scene.add(mesh)
})

function handleResize() {
  camera.aspect = getViewport().aspect
  camera.updateProjectionMatrix()
  renderer.setSize(getViewport().width, getViewport().height)
  composer.setSize(getViewport().width, getViewport().height)
}

window.addEventListener("resize", handleResize)

function animate() {
  requestAnimationFrame(animate)
  if(params.play) mesh.rotation.y += 0.0003
  composer.render()
}

animate()
