import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import Camera from "./Camera.js";
import { createAssetIstance } from "../assets.js";

const Scene = ({ iteration, city, onObjectSelected, isToolSelected }) => {
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);

    const rayCaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // last object that was selected.
    const [selectedObject, setSelectedObject] = useState(null);

    // object is currently hovering over
    let [hoveredObject, setHoveredObject] = useState(null);

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
        // console.log("Rendering new city");
        update(city);
    }, [iteration, city]);

    function initialize(city) {
        sceneRef.current.clear();
        const newTerrain = [];
        const newBuildings = [];
        for (let x = 0; x < city.size; x++) {
            const column = [];
            const buildingColumn = [];
            for (let y = 0; y < city.size; y++) {
                const terrainId = city.data[x][y].terrainId;
                const buildingId = city.data[x][y].building?.type;

                const mesh = createAssetIstance(terrainId, x, y);

                if (buildingId) {
                    const buildingMesh = createAssetIstance(buildingId, x, y, city.data[x][y].building);
                    sceneRef.current.add(buildingMesh);
                    buildingColumn.push(buildingMesh);
                } else {
                    buildingColumn.push(undefined);
                }

                sceneRef.current.add(mesh);
                column.push(mesh);
            };
            newTerrain.push(column);
            // buildings.push([...Array(city.size)]);  // NxN array of undefined.
            newBuildings.push(buildingColumn);
        };
        setTerrain(newTerrain);
        setBuildings(newBuildings);
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
                    newBuildingMeshes[x][y] = createAssetIstance(tile.building.type, x, y, tile.building);
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

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(gameWindow.offsetWidth, gameWindow.offsetHeight);
        renderer.setClearColor(0x000000, 0);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
        // Light sources are expensive, so only have one directional light
        // and use ambient light to fill in the shadows.
        const sun = new THREE.DirectionalLight(0xffffff, 1);
        sun.position.set(20, 20, 20);
        sun.castShadow = true;
        sun.shadow.camera.left = -10;
        sun.shadow.camera.right = 10;
        sun.shadow.camera.top = 0;
        sun.shadow.camera.bottom = -10;
        sun.shadow.mapSize.width = 1024;
        sun.shadow.mapSize.height = 1024;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 50;
        sceneRef.current.add(sun);

        // Ambient light makes the shadows less harsh.
        sceneRef.current.add(new THREE.AmbientLight(0xffffff, 0.5));

        // const helper = new THREE.CameraHelper(sun.shadow.camera);
        // sceneRef.current.add(helper);
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

    function onResize() {
        // TODO: not functioning properly
        cameraRef.current.camera.aspect = cameraRef.current.gameWindow.offsetWidth / cameraRef.current.gameWindow.offsetHeight;
        cameraRef.current.camera.updateProjectionMatrix();
        rendererRef.current.setSize(cameraRef.current.gameWindow.offsetWidth, cameraRef.current.gameWindow.offsetHeight);
    }

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
            if (selectedObject) {
                if (Array.isArray(selectedObject.material)) {
                    selectedObject.material.forEach(material => {
                        material.emissive?.setHex(0x000000);
                    })
                } else {
                    selectedObject.material.emissive?.setHex(0x000000);
                };
            };

            // If the object is already selected, deselect it.
            if (selectedObject === intersections[0].object) {
                setSelectedObject(null);
                return;
            };

            // Highlight the selected object.
            const currSelectedObject = intersections[0].object;
            if (!currSelectedObject) return;

            if (Array.isArray(currSelectedObject.material)) {
                currSelectedObject.material.forEach(material => {
                    material.emissive?.setHex(0xaaaa55);
                })
            } else {
                currSelectedObject.material.emissive?.setHex(0xaaaa55);
            };

            setSelectedObject(currSelectedObject);
            
            // Call the callback function with the selected object.
            if (onObjectSelected) onObjectSelected(currSelectedObject);
            
        };
    };

    const onMouseMove = (event) => {
        // Throttle the mouse move event to 60fps.
        if (Date.now() - cameraRef.current.lastMouseMove < 16) return;

        cameraRef.current.onMouseMove(event, isToolSelected);

        // Calculate mouse position in normalized device coordinates.
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update the picking ray with the camera and mouse position.
        rayCaster.setFromCamera(mouse, cameraRef.current.camera);

        let intersections = rayCaster.intersectObjects(sceneRef.current.children, false);

        if (intersections.length > 0) {

            if (hoveredObject) {
                if (Array.isArray(hoveredObject.material)) {
                    hoveredObject.material.forEach(material => {
                        material.emissive?.setHex(0x000000);
                    })
                } else {
                    hoveredObject.material.emissive?.setHex(0x000000);
                };
            };

            const currHoveredObject = intersections[0].object;
            if (!currHoveredObject) return;

            if (Array.isArray(currHoveredObject.material)) {
                currHoveredObject.material.forEach(material => {
                    material.emissive?.setHex(0x55aaaa);
                })
            } else {
                currHoveredObject.material.emissive?.setHex(0x55aaaa);
            };

            setHoveredObject(currHoveredObject);
        };

        // if left mouse-button is down, use tool as well
        if (hoveredObject && cameraRef.current.isLeftMouseDown) {
            onObjectSelected(hoveredObject);
        }
    };

    return (
        <div 
            id="render-target" 
            style={{ width: "100%", height: "100%" }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onResize={onResize}
        />
    );
};

export default Scene;