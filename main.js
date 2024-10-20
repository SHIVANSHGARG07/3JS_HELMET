import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// Scene setup
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 4;

// Renderer setup
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
  antialias: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

// OrbitControls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// RGBELoader setup
const rgbeLoader = new RGBELoader();
rgbeLoader.setDataType(THREE.FloatType); // Try using FloatType for HDR files

// Load HDR environment map
rgbeLoader.load(
  'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/spree_bank_1k.hdr',
  function (texture) {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
  
    scene.background = envMap;
    scene.environment = envMap;
  
    texture.dispose();
    pmremGenerator.dispose();

    // GLTF loader
    const loader = new GLTFLoader();

    // Load GLTF model
    loader.load(
      'public/DamagedHelmet.gltf',
      function (gltf) {
        scene.add(gltf.scene);
        gltf.scene.scale.set(2, 2, 2); // Adjust scale if needed
        gltf.scene.position.set(0, 0, 0); // Adjust position if needed
      },
      function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      function (error) {
        console.error('An error happened', error);
      }
    );
  },
  undefined, // onProgress callback
  function (error) {
    console.error('An error occurred while loading the HDR environment map:', error);
  }
);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
