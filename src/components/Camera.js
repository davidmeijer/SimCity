import * as THREE from "three";

class Camera {
    constructor(gameWindow) {
        this.gameWindow = gameWindow;

        this.DEG2RAD = Math.PI / 180;

        this.LEFT_MOUSE_BUTTON = 0;
        this.MIDDLE_MOUSE_BUTTON = 1;
        this.RIGHT_MOUSE_BUTTON = 2;

        this.MIN_CAMERA_RADIUS = 10;  // Minimum zoom distance.
        this.MAX_CAMERA_RADIUS = 20;  // Maximum zoom distance.
        this.MIN_CAMERA_ELEVATION = 30;
        this.MAX_CAMERA_ELEVATION = 90;
        this.ROTATION_SENSITIVITY = 0.5; 
        this.PAN_SENSITIVITY = 0.5;
        this.ZOOM_SENSITIVITY = 0.5; 

        this. Y_AXIS = new THREE.Vector3(0, 1, 0);

        this.isPanning = {
            forward: false,
            backward: false,
            left: false,
            right: false,
        };

        this.isZoomingIn = false;
        this.isZoomingOut = false;
        
        this.cameraOrigin = new THREE.Vector3(0, 0, 0);
        this.cameraRadius = (this.MIN_CAMERA_RADIUS + this.MAX_CAMERA_RADIUS) / 2;  // Initial zoom distance.
        this.cameraAzimuth = 135;
        this.cameraElevation = 0;
        this.isLeftMouseDown = false;
        this.isMiddleMouseDown = false;
        this.isRightMouseDown = false;
        this.prevMouseX = 0;
        this.prevMouseY = 0;

        this.createCamera();

        this.gameWindow.addEventListener("mousedown", this.onMouseDown);
        this.gameWindow.addEventListener("mouseup", this.onMouseUp);
        this.gameWindow.addEventListener("mousemove", this.onMouseMove);
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);

        this.animate();  // Start the animation loop for smooth movement.
    };

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(75, this.gameWindow.offsetWidth / this.gameWindow.offsetHeight, 0.1, 1000);
        this.updateCameraPosition();
    }

    updateCameraPosition() {
        this.camera.position.x = this.cameraRadius * Math.sin(this.cameraAzimuth * this.DEG2RAD) * Math.cos(this.cameraElevation * this.DEG2RAD);
        this.camera.position.y = this.cameraRadius * Math.sin(this.cameraElevation * this.DEG2RAD);
        this.camera.position.z = this.cameraRadius * Math.cos(this.cameraAzimuth * this.DEG2RAD) * Math.cos(this.cameraElevation * this.DEG2RAD);
        this.camera.position.add(this.cameraOrigin);
        this.camera.lookAt(this.cameraOrigin);
        this.camera.updateMatrix();
    };

    onMouseDown = (event) => {
        if (event.button === this.LEFT_MOUSE_BUTTON) {
            this.isLeftMouseDown = true;
        };
        if (event.button === this.MIDDLE_MOUSE_BUTTON) {
            this.isMiddleMouseDown = true;
        };
        if (event.button === this.RIGHT_MOUSE_BUTTON) {
            this.isRightMouseDown = true;
        };
    };

    onMouseUp = (event) => {
        if (event.button === this.LEFT_MOUSE_BUTTON) {
            this.isLeftMouseDown = false;
        };
        if (event.button === this.MIDDLE_MOUSE_BUTTON) {
            this.isMiddleMouseDown = false;
        };
        if (event.button === this.RIGHT_MOUSE_BUTTON) {
            this.isRightMouseDown = false
        };
    };

    onMouseMove = (event) => {
        const deltaX = event.clientX - this.prevMouseX;
        const deltaY = event.clientY - this.prevMouseY;

        // Handles the rotation of the camera.
        if (this.isLeftMouseDown) {
            this.cameraAzimuth -= (deltaX * this.ROTATION_SENSITIVITY);
            this.cameraElevation -= (deltaY * this.ROTATION_SENSITIVITY);
            this.cameraElevation = Math.min(this.MAX_CAMERA_ELEVATION, Math.max(this.MIN_CAMERA_ELEVATION, this.cameraElevation));
            this.updateCameraPosition();
        };

        this.prevMouseX = event.clientX;
        this.prevMouseY = event.clientY;
    };

    // Function to start panning and zooming on key press.
    onKeyDown = (event) => {
        switch (event.key) {
            case "ArrowUp":
                this.isPanning.forward = true;
                break;

            case "ArrowDown":
                this.isPanning.backward = true;
                break;

            case "ArrowRight":
                this.isPanning.right = true;
                break;

            case "ArrowLeft":
                this.isPanning.left = true;
                break;

            // Zoom in when '+' key is pressed (note: '+' is shift + '=' on most keyboards)
            case "=":
                this.isZoomingIn = true;
                break;

            case "-":
                this.isZoomingOut = true;
                break;

            default:
                break;
        }
    };

    // Function to stop panning on key release.
    onKeyUp = (event) => {
        switch (event.key) {
            case "ArrowUp":
                this.isPanning.forward = false;
                break;

            case "ArrowDown":
                this.isPanning.backward = false;
                break;

            case "ArrowRight":
                this.isPanning.right = false;
                break;

            case "ArrowLeft":
                this.isPanning.left = false;
                break;

            case "=":
                this.isZoomingIn = false;
                break;

            case "-":
                this.isZoomingOut = false;
                break;

            default:
                break;
        }
    };

    // Smooth zooming logic for zooming in
    zoomIn = () => {
        this.cameraRadius = Math.max(this.MIN_CAMERA_RADIUS, this.cameraRadius - this.ZOOM_SENSITIVITY);
        this.updateCameraPosition();
    };

    // Smooth zooming logic for zooming out
    zoomOut = () => {
        this.cameraRadius = Math.min(this.MAX_CAMERA_RADIUS, this.cameraRadius + this.ZOOM_SENSITIVITY);
        this.updateCameraPosition();
    };

    // Smooth panning logic.
    animate = () => {
        let forward, left;

        if (this.isPanning.forward) {
            forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(this.Y_AXIS, this.cameraAzimuth * this.DEG2RAD);
            this.cameraOrigin.add(forward.multiplyScalar(-this.PAN_SENSITIVITY));
            this.updateCameraPosition();
        }
        if (this.isPanning.backward) {
            forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(this.Y_AXIS, this.cameraAzimuth * this.DEG2RAD);
            this.cameraOrigin.add(forward.multiplyScalar(this.PAN_SENSITIVITY));
            this.updateCameraPosition();
        }
        if (this.isPanning.left) {
            left = new THREE.Vector3(1, 0, 0).applyAxisAngle(this.Y_AXIS, this.cameraAzimuth * this.DEG2RAD);
            this.cameraOrigin.add(left.multiplyScalar(-this.PAN_SENSITIVITY));
            this.updateCameraPosition();
        }
        if (this.isPanning.right) {
            left = new THREE.Vector3(1, 0, 0).applyAxisAngle(this.Y_AXIS, this.cameraAzimuth * this.DEG2RAD);
            this.cameraOrigin.add(left.multiplyScalar(this.PAN_SENSITIVITY));
            this.updateCameraPosition();
        }

        // Handle smooth zooming
        if (this.isZoomingIn) {
            this.zoomIn();
        }
        if (this.isZoomingOut) {
            this.zoomOut();
        }

        requestAnimationFrame(this.animate); // Continuously update for smooth movement
    };
};

export default Camera;