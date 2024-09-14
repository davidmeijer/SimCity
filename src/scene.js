import * as THREE from "https://unpkg.com/three@0.168.0/build/three.module.js";

// create export module that handles all scene exports, creations etc.
export function createScene() {
    // initial scene setup
    const gameWindow = document.getElementById("render-target");
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x777777);

    // near plane: 0.1
    // far plane: 1000
    // anything between 0.1 and 1000 will be rendered
    const camera = new THREE.PerspectiveCamera(75, gameWindow.offsetWidth / gameWindow.offsetHeight, 0.1, 1000);
    camera.position.z = 5; // move the camera back a bit so we can see the cube
    
    // work horse of the scene, renders the scene
    const renderer = new THREE.WebGLRenderer();

    // set the size of the renderer to the size of the game window
    renderer.setSize(gameWindow.offsetWidth, gameWindow.offsetHeight);

    // add the renderer to the game window
    gameWindow.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    
    function draw() {
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
        renderer.render(scene, camera);
    };
    
    // start animation loop
    function start() {
        renderer.setAnimationLoop(draw);
    };

    // stop animation loop
    function stop() {
        renderer.setAnimationLoop(null);
    };

    // pass functions back to the main script
    return {
        start,
        stop,
    };
};