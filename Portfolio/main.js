import './style.css'

import * as THREE from "three";

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import WebGL from 'three/addons/capabilities/WebGL.js';

//Postprocerssing
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

if ( WebGL.isWebGLAvailable()){
  //Settings
  const debugEnabled = false;

  //Scene
  const scene = new THREE.Scene();

  //Camera
  const aspectRatio = window.innerWidth / window.innerHeight;
  const nearPlane = 0.1;
  const farPlane = 1500;
  const camera = new THREE.PerspectiveCamera(75, aspectRatio, nearPlane, farPlane);

  //Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.position.z = 30;
  renderer.setClearColor('#000000');

  //Composer
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera); composer.addPass( renderPass );
  const glitchPass = new GlitchPass(); composer.addPass( glitchPass );
  const outputPass = new OutputPass(); composer.addPass( outputPass );


  //Colors
  const blue = 0x1a379d;
  const orange = 0xFF6432;
  const white = 0xFFFFFF;
  const red = 0xFF0000;
  const yellow = 0xFFD700;

  //Geometry
  const G_ico = new THREE.IcosahedronGeometry(3, 0);
  const G_ico2 = new THREE.IcosahedronGeometry(1.5, 0);
  const plane = new THREE.PlaneGeometry(200, 200, 32, 32);

  const G_thorus = new THREE.TorusGeometry(10, 3, 16, 100);

  //Suzanne
  const gltfLoader = new GLTFLoader();
  const suzannePath = 'models/suzanne.glb';
  gltfLoader.load(suzannePath, function(gltf){
    scene.add(gltf.scene);
    gltf.scene.position.setZ(5);
  }, undefined, function (error) {
    console.error(error);
  });

  //Textures
  //You can pass a callbackhere for when the asset is finished loading
  const textureLoader = new THREE.TextureLoader();
  const T_CloudGlitched = textureLoader.load('textures/T_CloudGlitched.png')
  const T_Caustic = textureLoader.load('textures/T_Caustic.png')

  //Materials
  //Basics
  const M_Orange = new THREE.MeshBasicMaterial({ color: orange, wireframe: true, });
  const M_Blue = new THREE.MeshStandardMaterial({ color: blue, wireframe: false, map:T_Caustic, normalMap:T_CloudGlitched});
  const M_Caustics = new THREE.MeshBasicMaterial({map: T_Caustic});
  //Lighted
  const M_LightTest = new THREE.MeshStandardMaterial({color:white});
  const M_Toon = new THREE.MeshToonMaterial({map:T_Caustic});

  //Meshes Objects
  const ico = new THREE.Mesh(G_ico, M_Toon);
  const ico2 = new THREE.Mesh(G_ico2, M_LightTest);
  const ground = new THREE.Mesh(plane, M_Toon);
  ground.rotation.set(-90, 0, 0);
  ground.position.setY(-25);
  const thorus = new THREE.Mesh(G_thorus, M_Blue);
  thorus.position.setZ(-1);
  scene.add(ico, thorus, ico2, ground);

  //Lights
  const pointLight = new THREE.PointLight(white);
  const ambiantLight = new THREE.AmbientLight(red);
  pointLight.position.set(5, 5, 5);
  ambiantLight.position.set(0, 3, 0);

  scene.add(pointLight, ambiantLight);

  //Helpers
  const pointLightHelper = new THREE.PointLightHelper(pointLight);
  const ambiantLightHelper = new THREE.PointLightHelper(ambiantLight);
  const gridHelper = new THREE.GridHelper(200, 200);
  if(debugEnabled){
    scene.add(pointLightHelper, ambiantLightHelper);
    scene.add(gridHelper);
  }

  //Controls
  const controls = new OrbitControls(camera, renderer.domElement);

  //Stars
  function AddStar(){
    const star = new THREE.Mesh(
      new THREE.SphereGeometry(0.1 , 24, 24),
      M_Orange
    );

    const [x, y, z] = Array(3).fill().map( () => THREE.MathUtils.randFloatSpread(100));

    star.position.set(x, y, z);
    scene.add(star);
  };

  Array(200).fill().forEach(AddStar); 

  //Skybox
  scene.background = T_CloudGlitched;

  const cubeLoader = new THREE.CubeTextureLoader();
  cubeLoader.setPath('textures/skybox/');
  let skyboxTexture = cubeLoader.load([
    'right.png', 'left.png',
    'top.png', 'bottom.png',
    'back.png', 'front.png'
  ]);

  const skyboxSize = 1000;
  const skyboxGeom = new THREE.BoxGeometry(skyboxSize, skyboxSize,skyboxSize);
  const M_Skybox = new THREE.MeshBasicMaterial({ envMap:skyboxTexture, side:THREE.BackSide, wireframe:false});
  const skybox = new THREE.Mesh(skyboxGeom, M_Skybox);
  scene.add(skybox);

  function moveCamera(){
    const t = document.body.getBoundingClientRect().top;

      //Thorus
    //thorusMesh.rotation.x += 0.01;
    //thorusMesh.rotation.y += 0.005;
    thorus.rotation.z += 0.01;

    //Ico
    ico.rotation.x -= 0.01;
    ico.rotation.y += 0.05;
    ico.rotation.z -= 0.02;
    
    //Ico2
    //ico2.position.x += Math.sin(ico.rotation.x);
  const offset = -10;
  
    camera.position.z = t * -0.01;
    camera.position.x = t * -0.0002;
    camera.position.y = t * -0.0002; 

  }

  document.body.onscroll = moveCamera;
  //CORE LOOP
  function animate(){
    requestAnimationFrame(animate);



    //Controls
    controls.update();

    //Camera
    //camera.position.z -= Math.sin(thorus.rotation.z / 10) * 0.25;
    renderer.render(scene, camera);
    composer.render();
  }

  animate();

} else{
  const warning = WebGL.getWebGLErrorMessage();
  document.getElementById('canvas').appendChild(warning);
}
