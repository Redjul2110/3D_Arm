// 3D Robot Arm Simulator - REDESIGNED with proper kinematics

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ObjectManager } from './objectManager.js';
import { LevelManager } from './levelManager.js';
import { Storage } from './storage.js';

class RobotArmSimulator {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        // Robot arm parts - REDESIGNED hierarchy
        this.baseMount = null;
        this.baseTurntable = null;
        this.shoulderJoint = null;
        this.upperArmLink = null;
        this.elbowJoint = null;
        this.forearmLink = null;
        this.wristPitchJoint = null;
        this.wristRollJoint = null;
        this.gripperBase = null;
        this.gripperLeftFinger = null;
        this.gripperRightFinger = null;

        // Joint angles
        this.angles = {
            base: 0,
            shoulder: 0,
            elbow: 0,
            wristPitch: 0,
            wristRoll: 0,
            gripper: 0
        };

        // Object manager
        this.objectManager = null;

        // Level Manager & Storage
        this.levelManager = null;
        this.storage = new Storage();

        this.isPlayingAnimation = false;

        this.isActive = false;
    }

    init() {
        const canvas = document.getElementById('robotCanvas');

        // Scene Setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        this.scene.fog = new THREE.Fog(0x000000, 10, 50);

        // Camera Setup
        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(6, 5, 6);
        this.camera.lookAt(0, 2, 0);

        // Renderer Setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Orbit Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.target.set(0, 2, 0);
        this.controls.maxDistance = 20;
        this.controls.minDistance = 3;

        // Lighting
        this.setupLighting();

        // Grid and Floor
        this.createFloor();

        // Robot Arm - REDESIGNED
        this.createRobotArmRedesigned();

        // Object Manager
        this.objectManager = new ObjectManager(this.scene);

        // Level Manager
        this.levelManager = new LevelManager(this.scene, this.objectManager, this.storage);

        // Spawn test objects
        this.spawnTestObjects();

        // Event Listeners
        window.addEventListener('resize', () => this.onWindowResize());

        this.isActive = true;
        this.animate();
    }

    setupLighting() {
        // Ambient Light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Main Directional Light
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(5, 10, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -10;
        mainLight.shadow.camera.right = 10;
        mainLight.shadow.camera.top = 10;
        mainLight.shadow.camera.bottom = -10;
        this.scene.add(mainLight);

        // Fill Light - Orange tint
        const fillLight = new THREE.DirectionalLight(0xff6b35, 0.3);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);

        // Accent Light - Red tint
        const accentLight = new THREE.PointLight(0xff4757, 0.5, 10);
        accentLight.position.set(0, 3, 3);
        this.scene.add(accentLight);
    }

    createFloor() {
        // Grid - Orange accent
        const gridHelper = new THREE.GridHelper(20, 20, 0xff6b35, 0x2a2a2a);
        gridHelper.material.opacity = 0.3;
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);

        // Floor Plane
        const floorGeometry = new THREE.PlaneGeometry(20, 20);
        const floorMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Reference Axes
        const axesHelper = new THREE.AxesHelper(2);
        axesHelper.position.y = 0.01;
        this.scene.add(axesHelper);
    }

    createRobotArmRedesigned() {
        this.createMaterials();

        // 1. BASE STRUCTURE
        this.createBaseV2();

        // 2. TURRET (Base Rotation)
        this.createTurretV2();

        // 3. SHOULDER
        this.createShoulderV2();

        // 4. UPPER ARM
        this.createUpperArmV2();

        // 5. ELBOW
        this.createElbowV2();

        // 6. FOREARM
        this.createForearmV2();

        // 7. WRIST
        this.createWristV2();

        // 8. GRIPPER
        this.createGripperV2();

        // 9. CABLES (Static decoration)
        this.createCables();
    }

    createMaterials() {
        this.matBody = new THREE.MeshStandardMaterial({
            color: 0x2c3e50, // Dark Gunmetal
            metalness: 0.7,
            roughness: 0.35,
            flatShading: false
        });

        this.matOrange = new THREE.MeshStandardMaterial({
            color: 0xff6b35, // Safety Orange
            metalness: 0.2,
            roughness: 0.5,
            emissive: 0xff6b35,
            emissiveIntensity: 0.05
        });

        this.matChrome = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.95,
            roughness: 0.1
        });

        this.matDark = new THREE.MeshStandardMaterial({
            color: 0x111111,
            metalness: 0.8,
            roughness: 0.7
        });

        this.matCable = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.9
        });
    }

    createBaseV2() {
        this.baseMount = new THREE.Group();
        this.baseMount.position.y = 0;
        this.scene.add(this.baseMount);

        // Heavy Base Plate
        const plate = new THREE.Mesh(
            new THREE.CylinderGeometry(1.4, 1.45, 0.1, 32),
            this.matDark
        );
        plate.position.y = 0.05;
        plate.receiveShadow = true;
        this.baseMount.add(plate);

        // Mounting Bolts (Hex Circle)
        for (let i = 0; i < 8; i++) {
            const bolt = new THREE.Mesh(
                new THREE.CylinderGeometry(0.06, 0.06, 0.08, 6),
                this.matChrome
            );
            const ang = (i / 8) * Math.PI * 2;
            bolt.position.set(Math.cos(ang) * 1.25, 0.1, Math.sin(ang) * 1.25);
            this.baseMount.add(bolt);
        }

        // Main Pedestal Housing
        const ped = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 1.1, 0.5, 32),
            this.matBody
        );
        ped.position.y = 0.35;
        ped.castShadow = true;
        this.baseMount.add(ped);
    }

    createTurretV2() {
        this.baseTurntable = new THREE.Group();
        this.baseTurntable.position.y = 0.6; // Top of pedestal
        this.baseMount.add(this.baseTurntable);

        // Turret Disk
        const disk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 0.8, 0.15, 32),
            this.matBody
        );
        disk.position.y = 0.075;
        disk.castShadow = true;
        this.baseTurntable.add(disk);

        // Shoulder Mount Brackets (U-Shape)
        const bracketGeom = new THREE.BoxGeometry(0.2, 0.6, 0.6);

        const leftBracket = new THREE.Mesh(bracketGeom, this.matBody);
        leftBracket.position.set(-0.4, 0.4, 0);
        leftBracket.castShadow = true;
        this.baseTurntable.add(leftBracket);

        const rightBracket = leftBracket.clone();
        rightBracket.position.set(0.4, 0.4, 0);
        this.baseTurntable.add(rightBracket);

        // Motor for Shoulder (Attached to side of turret)
        const motor = this.createServoMotor();
        motor.rotation.z = Math.PI / 2;
        motor.position.set(0.6, 0.4, 0);
        this.baseTurntable.add(motor);
    }

    createShoulderV2() {
        this.shoulderJoint = new THREE.Group();
        this.shoulderJoint.position.y = 0.4; // Center of brackets
        this.baseTurntable.add(this.shoulderJoint);

        // Axle - Aligned to X-axis (Rotation Axis)
        const axle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 1.0, 16),
            this.matChrome
        );
        axle.rotation.x = Math.PI / 2; // Fixed: Align to X axis which corresponds to Z-rotation visual
        this.shoulderJoint.add(axle);
    }

    createUpperArmV2() {
        this.upperArmGroup = new THREE.Group();
        this.shoulderJoint.add(this.upperArmGroup);

        // Main Sparse Structure like KUKA
        const armLength = 1.6;

        // Lower heavy block
        const lowerBlock = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.6, 0.4),
            this.matOrange
        );
        lowerBlock.position.y = 0.3;
        lowerBlock.castShadow = true;
        this.upperArmGroup.add(lowerBlock);

        // Long Shaft
        const shaftTitle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.25, armLength - 0.6, 16),
            this.matBody
        );
        shaftTitle.position.y = 0.3 + (armLength - 0.6) / 2 + 0.1;
        shaftTitle.castShadow = true;
        this.upperArmGroup.add(shaftTitle);

        // Logo Plate
        const logoPlate = new THREE.Mesh(
            new THREE.PlaneGeometry(0.2, 0.8),
            this.matDark
        );
        logoPlate.position.set(0.18, 1.0, 0);
        logoPlate.rotation.y = Math.PI / 2;
        this.upperArmGroup.add(logoPlate);
    }

    createElbowV2() {
        this.elbowJoint = new THREE.Group();
        this.elbowJoint.position.y = 1.6; // End of upper arm
        this.upperArmGroup.add(this.elbowJoint);

        // Elbow Housing (Round massive joint) - MADE SMALLER
        const housing = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.25, 0.5, 32), // Fixed: Radius 0.25
            this.matOrange
        );
        housing.rotation.x = Math.PI / 2; // Fixed: Align to X axis
        housing.castShadow = true;
        this.elbowJoint.add(housing);

        // Motor details on side
        const cap = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32),
            this.matDark
        );
        cap.rotation.x = Math.PI / 2; // Fixed: Align to X
        cap.position.z = 0.3; // Fixed: Offset in Z (side of housing)
        this.elbowJoint.add(cap);
    }

    createForearmV2() {
        this.forearmGroup = new THREE.Group();
        this.elbowJoint.add(this.forearmGroup);

        // Offset beam (forearm often offset from elbow center)
        const beam = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 1.2, 0.25),
            this.matBody
        );
        beam.position.set(0, 0.6, 0); // 1.2 length
        beam.castShadow = true;
        this.forearmGroup.add(beam);

        // Hydraulic Cylinder Decoration
        const cyl = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 0.6, 16),
            this.matChrome
        );
        cyl.position.set(0, 0.4, 0.2);
        this.forearmGroup.add(cyl);
    }

    createWristV2() {
        // WRIST PITCH
        this.wristPitchJoint = new THREE.Group();
        this.wristPitchJoint.position.y = 1.2;
        this.forearmGroup.add(this.wristPitchJoint);

        // Wrist Joint Sphere
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.22, 32, 32),
            this.matOrange
        );
        sphere.castShadow = true;
        this.wristPitchJoint.add(sphere);

        // WRIST ROLL
        this.wristRollGroup = new THREE.Group();
        this.wristPitchJoint.add(this.wristRollGroup);

        // Flange
        const flange = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 0.1, 32),
            this.matDark
        );
        flange.position.y = 0.22;
        this.wristRollGroup.add(flange);

        this.wristRollJoint = new THREE.Group();
        this.wristRollJoint.position.y = 0.27; // Tool mount point
        this.wristRollGroup.add(this.wristRollJoint);
    }

    createGripperV2() {
        // Industrial Parallel Gripper

        // Base Unit
        const base = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.12, 0.15),
            this.matDark
        );
        base.position.y = 0.06;
        base.castShadow = true;
        this.wristRollJoint.add(base);
        this.gripperBase = base; // For collision ref

        // Sliding Rails
        const rail = new THREE.Mesh(
            new THREE.BoxGeometry(0.32, 0.02, 0.05),
            this.matChrome
        );
        rail.position.y = 0.02;
        rail.position.z = 0.06;
        base.add(rail);

        // Fingers (Moving parts)
        const fingerGeom = new THREE.BoxGeometry(0.05, 0.25, 0.08);

        this.gripperLeftFinger = new THREE.Mesh(fingerGeom, this.matBody);
        this.gripperLeftFinger.position.set(-0.08, 0.18, 0);
        this.gripperLeftFinger.castShadow = true;
        this.wristRollJoint.add(this.gripperLeftFinger); // Add to joint, not base, for independent animation logic

        this.gripperRightFinger = new THREE.Mesh(fingerGeom, this.matBody);
        this.gripperRightFinger.position.set(0.08, 0.18, 0);
        this.gripperRightFinger.castShadow = true;
        this.wristRollJoint.add(this.gripperRightFinger);

        // Rubber pads
        const pad = new THREE.Mesh(
            new THREE.BoxGeometry(0.01, 0.15, 0.08),
            this.matDark
        );
        pad.position.set(0.03, 0, 0);
        this.gripperLeftFinger.add(pad);

        const pad2 = pad.clone();
        pad2.position.set(-0.03, 0, 0);
        this.gripperRightFinger.add(pad2);
    }

    createServoMotor() {
        const group = new THREE.Group();

        // Main block
        const block = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.4, 0.6),
            this.matDark
        );
        group.add(block);

        // Cooling fins
        for (let i = 0; i < 5; i++) {
            const fin = new THREE.Mesh(
                new THREE.BoxGeometry(0.42, 0.02, 0.5),
                this.matBody
            );
            fin.position.y = -0.15 + (i * 0.08);
            group.add(fin);
        }

        return group;
    }

    createCables() {
        // Simplistic cable loops for decoration
        // 1. Base to Turret loop
        this.addCableCurve(
            new THREE.Vector3(0.4, 0.2, 0.4),
            new THREE.Vector3(0.4, 0.5, 0.4),
            this.baseMount
        );

        // 2. Turret to Shoulder
        this.addCableCurve(
            new THREE.Vector3(-0.3, 0.5, 0),
            new THREE.Vector3(-0.3, 0.8, -0.2),
            this.baseTurntable
        );
    }

    addCableCurve(start, end, parent) {
        const path = new THREE.CatmullRomCurve3([
            start,
            new THREE.Vector3(
                (start.x + end.x) / 2 + 0.1,
                (start.y + end.y) / 2,
                (start.z + end.z) / 2
            ),
            end
        ]);

        const geom = new THREE.TubeGeometry(path, 8, 0.02, 6, false);
        const mesh = new THREE.Mesh(geom, this.matCable);
        parent.add(mesh);
    }

    updateJoints(angles) {
        // Update angles
        this.angles = { ...this.angles, ...angles };

        // Apply rotations at correct pivot points
        if (this.baseTurntable) {
            this.baseTurntable.rotation.y = THREE.MathUtils.degToRad(this.angles.base);
        }

        if (this.upperArmGroup) {
            this.upperArmGroup.rotation.z = THREE.MathUtils.degToRad(this.angles.shoulder);
        }

        if (this.elbowJoint) {
            this.elbowJoint.rotation.z = THREE.MathUtils.degToRad(this.angles.elbow);
        }

        if (this.wristRollGroup) { // Pitch is now on rollGroup parent in V2? No, wristPitchJoint
            if (this.wristPitchJoint) {
                this.wristPitchJoint.rotation.x = THREE.MathUtils.degToRad(this.angles.wristPitch);
            }
        }

        // V2 Structure Mapping:
        // wristPitchJoint (Group) -> wristRollGroup (Group) -> wristRollJoint (Group) -> Gripper
        if (this.wristRollJoint) {
            this.wristRollJoint.rotation.y = THREE.MathUtils.degToRad(this.angles.wristRoll);
        }

        // Gripper - move fingers inward/outward symmetrically
        if (this.gripperLeftFinger && this.gripperRightFinger) {
            const openDistance = THREE.MathUtils.degToRad(this.angles.gripper) * 0.4;
            this.gripperLeftFinger.position.x = -0.08 - openDistance;
            this.gripperRightFinger.position.x = 0.08 + openDistance;
        }

        // Update object manager with gripper position
        if (this.objectManager) {
            const gripperPos = this.getGripperCenterPosition();

            // Auto pickup/drop logic based on physical clamping
            // 1. Calculate distance between fingers
            const openDistance = THREE.MathUtils.degToRad(this.angles.gripper) * 0.4;
            const currentGripperWidth = 0.16 + (openDistance * 2);

            // 2. Check for objects to pick up
            if (!this.objectManager.attachedObject) {
                // Only try to pick up if we are closing the gripper (angle < 40 degrees)
                // and if we are not fully closed (angle > 0)
                if (this.angles.gripper < 40 && this.angles.gripper > 0) {
                    // Check if any object is between fingers
                    const nearbyObject = this.objectManager.checkClamping(
                        gripperPos,
                        currentGripperWidth,
                        this.gripperLeftFinger.getWorldPosition(new THREE.Vector3()),
                        this.gripperRightFinger.getWorldPosition(new THREE.Vector3())
                    );

                    if (nearbyObject) {
                        this.objectManager.attachToGripper(nearbyObject, this.gripperBase);
                    }
                }
            }

            // 3. Auto release if gripper opens too wide
            if (this.objectManager.attachedObject) {
                // If gripper opens wider than object size + tolerance, drop it
                const objSize = this.objectManager.attachedObject.userData.size || 0.3;
                if (currentGripperWidth > objSize + 0.1) {
                    this.objectManager.releaseObject();
                }
            }

            // Update attached object position
            this.objectManager.updateAttachedObject(gripperPos);
        }
    }

    getGripperCenterPosition() {
        if (!this.gripperBase) return new THREE.Vector3();

        const worldPos = new THREE.Vector3();
        this.gripperBase.getWorldPosition(worldPos);
        // Offset to valid center point between fingers
        // Gripper base is at y=0.025 relative to wristRollJoint (V2)
        // Fingers are at y=0.18 relative to base (total ~0.2)

        const up = new THREE.Vector3(0, 1, 0);
        up.applyQuaternion(this.gripperBase.getWorldQuaternion(new THREE.Quaternion()));

        // Add specific offset to reach sweet spot between fingers tip
        worldPos.add(up.multiplyScalar(0.25));
        return worldPos;
    }

    getGripperWidth() {
        const openDistance = THREE.MathUtils.degToRad(this.angles.gripper) * 0.4;
        return 0.16 + (openDistance * 2);
    }

    spawnTestObjects() {
        if (!this.objectManager) return;
        this.objectManager.spawnObject('cube', new THREE.Vector3(2, 0.15, 0), '#ff6b35', 0.3);
        this.objectManager.spawnObject('sphere', new THREE.Vector3(-2, 0.2, 1), '#ff4757', 0.2);
        this.objectManager.spawnObject('cube', new THREE.Vector3(0, 0.15, -2), '#ffa502', 0.3);
    }

    resetPosition() {
        this.updateJoints({
            base: 0,
            shoulder: 0,
            elbow: 0,
            wristPitch: 0,
            wristRoll: 0,
            gripper: 0
        });
    }

    clearObjects() {
        if (this.objectManager) {
            this.objectManager.clearAll();
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Get array of collision spheres for the robot arm
     */
    getColliders() {
        const colliders = [];

        // Helper to add collider
        const add = (obj, radius) => {
            if (obj) {
                const pos = new THREE.Vector3();
                obj.getWorldPosition(pos);
                colliders.push({ position: pos, radius: radius });
            }
        };

        // Add colliders for new high-fidelity parts
        if (this.baseMount) add(this.baseMount, 0.8);
        if (this.baseTurntable) add(this.baseTurntable, 0.7);
        // Shoulder is now a group, use its position
        if (this.shoulderJoint) add(this.shoulderJoint, 0.5);

        // Upper arm needs multiple colliders along the beam
        if (this.upperArmLink) {
            const start = new THREE.Vector3();
            const end = new THREE.Vector3();
            this.upperArmLink.getWorldPosition(start); // Center (0.8 up)
            // Approx positions along the arm
            colliders.push({ position: start, radius: 0.4 });
        }

        if (this.elbowJoint) add(this.elbowJoint, 0.4);

        // Forearm
        if (this.forearmLink) {
            const pos = new THREE.Vector3();
            this.forearmLink.getWorldPosition(pos);
            add(this.forearmLink, 0.3);
        }

        if (this.wristPitchJoint) add(this.wristPitchJoint, 0.3);
        if (this.gripperBase) add(this.gripperBase, 0.25);

        return colliders;
    }

    animate() {
        if (!this.isActive) return;

        requestAnimationFrame(() => this.animate());

        // Update Physics (Fixed DT for consistency)
        const dt = 0.016;
        if (this.objectManager) {
            // Get colliders from arm
            const armColliders = this.getColliders ? this.getColliders() : [];
            this.objectManager.update(dt, armColliders);
        }

        // Update Level Manager
        if (this.levelManager && this.levelManager.isActive) {
            const levelStatus = this.levelManager.update();
            if (levelStatus && levelStatus.status === 'completed') {
                console.log('Level Completed!', levelStatus);
                this.levelManager.completeLevel();

                // Dispatch custom event for UI to catch
                const event = new CustomEvent('levelCompleted', { detail: levelStatus });
                window.dispatchEvent(event);
            }
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        this.isActive = false;
        if (this.controls) {
            this.controls.dispose();
        }
        // Additional cleanup could go here
    }
}

// Export for use in app.js
export { RobotArmSimulator };
