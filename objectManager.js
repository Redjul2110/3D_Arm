// Object Manager - Handles 3D objects in the scene
import * as THREE from 'three';

export class ObjectManager {
    constructor(scene) {
        this.scene = scene;
        this.objects = new Map();
        this.nextId = 1;
        this.attachedObject = null;
        this.attachPoint = null;
        this.gravity = -9.8;
    }

    /**
     * Update physics for all objects
     * @param {number} dt - Delta time in seconds
     * @param {Array} armColliders - Array of {position, radius} from robot arm
     */
    update(dt, armColliders = []) {
        // Clamp dt to avoid huge jumps
        dt = Math.min(dt, 0.05);

        for (const [id, obj] of this.objects.entries()) {
            // Skip attached objects (they follow the gripper)
            if (this.attachedObject && this.attachedObject.userData.id === id) continue;

            // Skip static objects if any
            if (obj.userData.isStatic) continue;

            const u = obj.userData;

            // Apply Gravity
            if (!u.onFloor) {
                u.velocity.y += this.gravity * dt;
            }

            // Apply Velocity
            obj.position.addScaledVector(u.velocity, dt);

            // Floor Collision
            if (obj.position.y < u.radius) {
                obj.position.y = u.radius;
                u.velocity.y = 0;
                u.velocity.x *= 0.9; // Friction
                u.velocity.z *= 0.9;
                u.onFloor = true;
            } else {
                u.onFloor = false;
            }

            // Arm Collisions (Simple push)
            if (armColliders.length > 0) {
                for (const collider of armColliders) {
                    const dist = obj.position.distanceTo(collider.position);
                    const minDist = u.radius + collider.radius;

                    if (dist < minDist) {
                        // Collision detected! Push object away
                        const pushDir = new THREE.Vector3().subVectors(obj.position, collider.position).normalize();

                        // Prevent pushing into floor
                        if (pushDir.y < 0) pushDir.y = 0.1;
                        pushDir.normalize();

                        // Nudge position
                        const overlap = minDist - dist;
                        obj.position.addScaledVector(pushDir, overlap * 1.5); // 1.5 for stiff bounce

                        // Transfer energy to velocity
                        u.velocity.addScaledVector(pushDir, 2.0); // Adds bounce
                    }
                }
            }
        }
    }

    /**
     * Spawn a new object in the scene
     * @param {string} type - 'cube', 'sphere', 'cylinder'
     * @param {THREE.Vector3} position - World position
     * @param {string} color - Hex color
     * @param {number} size - Object size
     */
    spawnObject(type, position, color = '#ff6b35', size = 0.3) {
        const id = `obj_${this.nextId++}`;

        let geometry;
        let radius = size / 2; // Approximation for collision

        switch (type) {
            case 'sphere':
                geometry = new THREE.SphereGeometry(size / 2, 32, 32);
                radius = size / 2;
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(size / 2, size / 2, size, 32);
                radius = size / 2;
                break;
            case 'cube':
            default:
                geometry = new THREE.BoxGeometry(size, size, size);
                radius = size / 2; // Rough bounding sphere
                break;
        }

        const material = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.3,
            roughness: 0.4
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Store metadata & Physics Data
        mesh.userData = {
            id: id,
            type: type,
            spawned: Date.now(),
            pickable: true,
            velocity: new THREE.Vector3(0, 0, 0),
            isStatic: false,
            radius: radius,
            onFloor: false
        };

        this.scene.add(mesh);
        this.objects.set(id, mesh);

        return { id, mesh };
    }

    /**
     * Remove an object from the scene
     */
    removeObject(id) {
        const obj = this.objects.get(id);
        if (obj) {
            this.scene.remove(obj);
            obj.geometry.dispose();
            obj.material.dispose();
            this.objects.delete(id);
        }
    }

    /**
     * Remove all objects
     */
    clearAll() {
        for (const [id, obj] of this.objects.entries()) {
            this.scene.remove(obj);
            obj.geometry.dispose();
            obj.material.dispose();
        }
        this.objects.clear();
        this.attachedObject = null;
    }

    /**
     * Check if an object is clamped between fingers
     * @param {THREE.Vector3} centerPos - Center point between fingers
     * @param {number} gripperWidth - Distance between fingers
     * @param {THREE.Vector3} leftFingerPos - World pos of left finger
     * @param {THREE.Vector3} rightFingerPos - World pos of right finger
     */
    checkClamping(centerPos, gripperWidth, leftFingerPos, rightFingerPos) {
        let closestObject = null;
        let closestDistance = 1.0; // Max check radius

        for (const [id, obj] of this.objects.entries()) {
            if (!obj.userData.pickable) continue;
            if (this.attachedObject && this.attachedObject.userData.id === id) continue;

            const distance = centerPos.distanceTo(obj.position);

            // 1. Is object roughly between fingers?
            if (distance < closestDistance) {
                // 2. Is object size smaller than gripper width?
                // (with some tolerance to allow clamping)
                const objSize = obj.geometry.parameters.width || obj.geometry.parameters.radius * 2 || 0.3;

                // Allow pickup if gripper is slightly wider than object (loose grip)
                // or slightly smaller (tight grip/compression)
                if (gripperWidth >= objSize - 0.05 && gripperWidth <= objSize + 0.2) {
                    closestDistance = distance;
                    closestObject = obj;
                }
            }
        }

        // Final check: is object actually between the planes defined by fingers?
        if (closestObject) {
            // Simplified check: distance to center must be small
            if (closestDistance < 0.3) {
                return closestObject;
            }
        }

        return null;
    }

    /**
     * Check if gripper is close enough to pick up an object (Legacy/Backup)
     * @param {THREE.Vector3} gripperPosition - Position of gripper
     * @param {number} gripperAngle - Current gripper opening angle
     */
    checkPickup(gripperPosition, gripperAngle) {
        // Only pick up if gripper is sufficiently closed
        if (gripperAngle > 10) return null;

        const pickupRadius = 0.5;
        let closestObject = null;
        let closestDistance = pickupRadius;

        for (const [id, obj] of this.objects.entries()) {
            if (!obj.userData.pickable) continue;
            if (this.attachedObject && this.attachedObject.userData.id === id) continue;

            const distance = gripperPosition.distanceTo(obj.position);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestObject = obj;
            }
        }

        return closestObject;
    }

    /**
     * Attach an object to the gripper
     */
    attachToGripper(object, attachPoint) {
        if (!object) return false;

        this.attachedObject = object;
        this.attachPoint = attachPoint;

        // Visual feedback
        object.material.emissive = new THREE.Color(0xff6b35);
        object.material.emissiveIntensity = 0.3;

        return true;
    }

    /**
     * Release the attached object
     */
    releaseObject() {
        if (this.attachedObject) {
            // Remove visual feedback
            this.attachedObject.material.emissive = new THREE.Color(0x000000);
            this.attachedObject.material.emissiveIntensity = 0;

            // Enable physics
            this.attachedObject.userData.onFloor = false;
            // Reset velocity
            if (this.attachedObject.userData.velocity) {
                this.attachedObject.userData.velocity.set(0, 0, 0);
            }

            this.attachedObject = null;
            this.attachPoint = null;
        }
    }

    /**
     * Update attached object position (call every frame)
     */
    updateAttachedObject(gripperWorldPosition) {
        if (this.attachedObject && gripperWorldPosition) {
            this.attachedObject.position.copy(gripperWorldPosition);
            this.attachedObject.position.y += 0.3; // Offset to appear above gripper
        }
    }

    /**
     * Get all objects as array
     */
    getAllObjects() {
        return Array.from(this.objects.values());
    }

    /**
     * Export objects to JSON
     */
    exportToJSON() {
        const objectsData = [];
        for (const [id, obj] of this.objects.entries()) {
            objectsData.push({
                id: id,
                type: obj.userData.type,
                position: obj.position.toArray(),
                color: '#' + obj.material.color.getHexString(),
                size: obj.geometry.parameters.width || obj.geometry.parameters.radius
            });
        }
        return objectsData;
    }

    /**
     * Import objects from JSON
     */
    importFromJSON(data) {
        this.clearAll();
        for (const objData of data) {
            this.spawnObject(
                objData.type,
                new THREE.Vector3(...objData.position),
                objData.color,
                objData.size
            );
        }
    }
}
