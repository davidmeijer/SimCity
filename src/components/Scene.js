import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import Camera from "./Camera.js";
import { createAssetIstance } from "../assets.js";

const Scene = ({ iteration, city, onObjectSelected }) => {
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);

    const rayCaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const [selectedObject, setSelectedObject] = useState(null);

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
    }, [iteration, city]);

    function initialize(city) {
        sceneRef.current.clear();
        const newTerrain = [];
        for (let x = 0; x < city.size; x++) {
            const column = [];
            for (let y = 0; y < city.size; y++) {
                const terrainId = city.data[x][y].terrainId;

                const mesh = createAssetIstance(terrainId, x, y);
                sceneRef.current.add(mesh);
                column.push(mesh);
            };
            newTerrain.push(column);
            buildings.push([...Array(city.size)]);  // NxN array of undefined.
        };
        setTerrain(newTerrain);
    };

    function update(city) {
        const newBuildingMeshes = buildings;
        for (let x = 0; x < city.size; x++) {
            for (let y = 0; y < city.size; y++) {
                const tile = city.data[x][y];
                const existingBuildingMesh = buildings[x][y];

                // If the player removes a building, remove it from the scene.
                if (!tile.building && existingBuildingMesh) {
                    sceneRef.current.remove(existingBuildingMesh);
                    newBuildingMeshes[x][y] = undefined;
                };

                // If the data has changed, update the mesh.
                if (tile.building && tile.building.updated) {
                    sceneRef.current.remove(existingBuildingMesh);
                    // Pass full building as data object so that the height can be updated.
                    newBuildingMeshes[x][y] = createAssetIstance(tile.building.id, x, y, tile.building);
                    sceneRef.current.add(newBuildingMeshes[x][y]);
                    tile.building.updated = false; // Reset the flag.
                }
            };
        };
        setBuildings(newBuildingMeshes);
    };

    const createScene = () => {
        const gameWindow = document.getElementById("render-target");
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xbdc3c7);
        sceneRef.current = scene;

        cameraRef.current = new Camera(gameWindow, city.size);

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
            new THREE.AmbientLight(0xffffff, 0.3),
            new THREE.DirectionalLight(0xffffff, 0.8),
            new THREE.DirectionalLight(0xffffff, 0.5),
            new THREE.DirectionalLight(0xffffff, 0.5),
        ];

        lights[1].position.set(0, 1, 0);  // Top light.
        lights[2].position.set(1, 1, 0);  // Right light.
        lights[3].position.set(0, 1, 1);  // Front light.

        sceneRef.current.add(...lights);
    }

    const draw = () => {
        rendererRef.current.render(sceneRef.current, cameraRef.current.camera);
    };

    const start = () => {
        rendererRef.current.setAnimationLoop(draw);
    };

    const stop = () => {
        rendererRef.current.setAnimationLoop(null);
    };

    const onMouseDown = (event) => {
        cameraRef.current.onMouseDown(event);

        // Calculate mouse position in normalized device coordinates.
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update the picking ray with the camera and mouse position.
        rayCaster.setFromCamera(mouse, cameraRef.current.camera);

        let intersections = rayCaster.intersectObjects(sceneRef.current.children, false);

        if (intersections.length > 0) {
            // Unhighlight the previously selected object.
            if (selectedObject) selectedObject.material.emissive.setHex(0x000000); 

            // If the object is already selected, deselect it.
            if (selectedObject === intersections[0].object) {
                setSelectedObject(null);
                return;
            };

            // Highlight the selected object.
            const currSelectedObject = intersections[0].object;
            currSelectedObject.material.emissive.setHex(0x555555); 
            setSelectedObject(currSelectedObject);
            
            // Call the callback function with the selected object.
            if (onObjectSelected) onObjectSelected(currSelectedObject);
            
        };
    };

    return (
        <div 
            id="render-target" 
            style={{ width: "100%", height: "100%" }}
            onMouseDown={onMouseDown}
        />
    );
};

export default Scene;