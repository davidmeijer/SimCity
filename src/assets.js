import { TextureSharp } from "@mui/icons-material";
import * as THREE from "three";

import grass from "./textures/grass.png";
import residential1 from "./textures/residential1.png";
import residential2 from "./textures/residential2.png";
import residential3 from "./textures/residential3.png";
import commercial1 from "./textures/commercial1.png";
import commercial2 from "./textures/commercial2.png";
import commercial3 from "./textures/commercial3.png";
import industrial1 from "./textures/industrial1.png";
import industrial2 from "./textures/industrial2.png";
import industrial3 from "./textures/industrial3.png";

const cube = new THREE.BoxGeometry(1, 1, 1);

let loader = new THREE.TextureLoader();

function loadTexture(url) {
    const tex = loader.load(url)
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1); // Default repeat.
    return tex;
}

/* Texture library */
// Credit: https://opengameart.org/content/free-urban-textures-buildings-apartments-shop-fronts
const textures = {
    // 'grass': loadTexture('public/textures/grass.png'),
    'grass': loadTexture(grass),
    'residential1': loadTexture(residential1),
    'residential2': loadTexture(residential2),
    'residential3': loadTexture(residential3),
    'commercial1': loadTexture(commercial1),
    'commercial2': loadTexture(commercial2),
    'commercial3': loadTexture(commercial3),
    'industrial1': loadTexture(industrial1),
    'industrial2': loadTexture(industrial2),
    'industrial3': loadTexture(industrial3),
};

// Top of building.
function getTopMaterial() {
    return new THREE.MeshLambertMaterial({ color: 0x555555 });
};

// Uses textures from memory. Clone to get unique instances.
function getSideMaterial(textureName) {
    return new THREE.MeshLambertMaterial({ map: textures[textureName].clone() });
};

/**
 * Creates a new 3D asset
 * @param {string} type - The type of asset to create.
 * @param {number} x - The x-coordinate of the asset.
 * @param {number} y - The y-coordinate of the asset.
 * @param {object} data - Additional data for the asset.
 * @returns {THREE.Mesh} The asset instance.
 */
export function createAssetIstance(type, x, y, data) {
    // If asset exsits, configure it and return it.
    if (type in assets) {
        return assets[type](x, y, data);
    } else {
        console.warn(`Asset ${type} not found.`);
        return undefined;
    };
};

// Asset library
const assets = {
    'grass': (x, y) => {
        const material = new THREE.MeshLambertMaterial({ map: textures.grass });
        // const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
        const mesh = new THREE.Mesh(cube, material);
        mesh.userData = { x, y };
        mesh.position.set(x, -0.5, y);
        mesh.receiveShadow = true;
        return mesh;
    },
    'residential': (x, y, data) => createZoneMesh(x, y, data),
    'commercial': (x, y, data) => createZoneMesh(x, y, data),
    'industrial': (x, y, data) => createZoneMesh(x, y, data),
    'road': (x, y) => {
        const material = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const mesh = new THREE.Mesh(cube, material);
        mesh.userData = { x, y };
        mesh.scale.set(1, 0.02, 1);
        mesh.position.set(x, 0.01, y);
        mesh.receiveShadow = true;
        return mesh;
    },
    'tree': (x, y) => {
        // const material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        // const mesh = new THREE.Mesh(cube, material);
        // mesh.userData = { x, y };
        // mesh.scale.set(0.5, 1, 0.5);
        // mesh.position.set(x, 0.5, y);
        // mesh.castShadow = true;
        // mesh.receiveShadow = true;
        // return mesh;

        // Create the tree trunk (small brown cylinder)
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Brown color
        const trunkGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.3); // Small cylinder for trunk
        const trunkMesh = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunkMesh.position.set(x, 0.1, y); // Adjust position for trunk
        trunkMesh.castShadow = true;
        trunkMesh.receiveShadow = true;

        // Create the tree foliage (green cone)
        const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x00dd00 }); // Green color
        const foliageGeometry = new THREE.ConeGeometry(0.2, 1.5, 8); // Cone for foliage
        const foliageMesh = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliageMesh.position.set(x, 1, y); // Position foliage on top of the trunk
        foliageMesh.castShadow = true;
        foliageMesh.receiveShadow = true;

        // Create a parent object to hold both trunk and foliage
        const tree = new THREE.Group();
        tree.add(trunkMesh);
        tree.add(foliageMesh);
        tree.userData = { x, y };

        return tree;
    },
}
  
function createZoneMesh(x, y, data) {
    const textureName = data.type + data.style;

    const topMaterial = getTopMaterial();
    const sideMaterial = getSideMaterial(textureName);
    // const sideMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });

    // Assign unique materials to each face.
    let materialArray = [
        sideMaterial, // +X
        sideMaterial, // -X
        topMaterial, // +Y, top
        topMaterial, // -Y, bottom (not visible)
        sideMaterial, // +Z
        sideMaterial, // -Z
    ];
    let mesh = new THREE.Mesh(cube, materialArray);

    mesh.userData = { x, y };
    mesh.scale.set(0.8, (data.height - 0.95) / 2, 0.8);
    mesh.material.forEach(material => material.map?.repeat.set(1, data.height - 1));
    mesh.position.set(x, (data.height - 0.95) / 4, y);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}