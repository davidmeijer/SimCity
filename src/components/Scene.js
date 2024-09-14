import React, { useEffect, useRef } from "react";
import * as THREE from "three";

import Camera from "./Camera.js";

const Scene = () => {
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);

    useEffect(() => {
        createScene();
        start();

        // Clean up after rendered scene.
        return () => {
            stop();  
            disposeScene();
        };
    }, []);  // Empty dependency array means this effect will only run once.

    const createScene = () => {
        const gameWindow = document.getElementById("render-target");
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x777777);
        sceneRef.current = scene;

        cameraRef.current = new Camera(gameWindow).camera;

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(gameWindow.offsetWidth, gameWindow.offsetHeight);
        gameWindow.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
    };

    const disposeScene = () => {
        if (rendererRef.current) {
            rendererRef.current.domElement.remove();
            rendererRef.current.dispose();
            rendererRef.current.forceContextLoss();
        };

        if (sceneRef.current) {
            sceneRef.current.traverse((object) => {
                if (!object.isMesh) return;
                object.geometry.dispose();
                object.material.dispose();
            });
        }
    };

    const draw = () => {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    const start = () => {
        rendererRef.current.setAnimationLoop(draw);
    };

    const stop = () => {
        rendererRef.current.setAnimationLoop(null);
    };

    return (
        <div 
            id="render-target" 
            style={{ width: "100%", height: "100%" }}
        />
    );
};

export default Scene;