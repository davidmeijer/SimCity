import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import Camera from "./Camera.js";

const Scene = ({ iteration, city }) => {
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);

    const [prevIteration, setPrevIteration] = useState(0);
    const [terrain, setTerrain] = useState([]);
    const [buildings, setBuildings] = useState([]);

    useEffect(() => {
        createScene();
        start();

        // Clean up after rendered scene.
        return () => {
            stop();  
            disposeScene();
        };
    }, []);  // Empty dependency array means this effect will only run once.

    // Rerender every time the city was updated.
    useEffect(() => {
        if (iteration === prevIteration) return;
        console.log("Rendering new city");
        update(city);
    }, [iteration]);

    function initialize(city) {
        sceneRef.current.clear();
        const newTerrain = [];
        for (let x = 0; x < city.size; x++) {
            const column = [];
            for (let y = 0; y < city.size; y++) {
                // Grass geometry.
                const terrainGeometry = new THREE.BoxGeometry(1, 1, 1);
                const terrainMaterial = new THREE.MeshLambertMaterial({ color: 0x00aa00 });
                const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);                
                terrainMesh.position.set(x, -0.5, y);
                sceneRef.current.add(terrainMesh);
                column.push(terrainMesh);
            };
            newTerrain.push(column);
            buildings.push([...Array(city.size)]);  // NxN array of undefined.
        };
        setTerrain(newTerrain);
    };

    function update(city) {
        const newBuildingMeshes = [];
        for (let x = 0; x < city.size; x++) {
            const column = [];
            for (let y = 0; y < city.size; y++) {
                // Building geometry.
                const tile = city.data[x][y];

                if (tile.building && tile.building.startsWith("building")) {
                    const height = parseInt(tile.building.split("-")[1]);
                    const buildingGeometry = new THREE.BoxGeometry(1, height, 1);  // TODO: Reuse geometry.
                    const buildingMaterial = new THREE.MeshLambertMaterial({ color: 0x777777 });  // TODO: Reuse material.
                    const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
                    buildingMesh.position.set(x, height / 2, y);
                    
                    if (buildings[x][y]) {
                        sceneRef.current.remove(buildings[x][y]);
                    };

                    sceneRef.current.add(buildingMesh);
                    column.push(buildingMesh);
                };
            };
            newBuildingMeshes.push(column);
        };
        setBuildings(newBuildingMeshes);
    };

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
    
        initialize(city);

        setupLights();
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

    const setupLights = () => {
        const lights = [
            new THREE.AmbientLight(0xffffff, 0.2),
            new THREE.DirectionalLight(0xffffff, 0.3),
            new THREE.DirectionalLight(0xffffff, 0.3),
            new THREE.DirectionalLight(0xffffff, 0.3),
        ];

        lights[1].position.set(0, 1, 0);  // Top light.
        lights[2].position.set(1, 1, 0);  // Right light.
        lights[3].position.set(0, 1, 1);  // Front light.

        sceneRef.current.add(...lights);
    }

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