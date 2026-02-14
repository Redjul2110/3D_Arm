// Level Manager - Handles level loading, win conditions, and scoring
import * as THREE from 'three';
import { getLevelById } from './levelData.js';

export class LevelManager {
    constructor(scene, objectManager, storage) {
        this.scene = scene;
        this.objectManager = objectManager;
        this.storage = storage;

        this.currentLevel = null;
        this.levelStartTime = 0;
        this.elapsedTime = 0;
        this.isActive = false;
        this.targetMeshes = [];
        this.obstacleMeshes = [];
        this.targetStates = []; // Track which targets have objects
    }

    /**
     * Load and start a level
     */
    loadLevel(levelId) {
        const levelData = getLevelById(levelId);
        if (!levelData) {
            console.error(`Level ${levelId} not found`);
            return false;
        }

        this.currentLevel = levelData;
        this.isActive = true;
        this.levelStartTime = performance.now();
        this.elapsedTime = 0;

        // Clear existing objects
        this.objectManager.clearAll();
        this.clearTargets();
        this.clearObstacles();

        // Spawn level objects
        levelData.objects.forEach(obj => {
            this.objectManager.spawnObject(
                obj.type,
                new THREE.Vector3(...obj.position),
                obj.color,
                obj.size
            );
        });

        // Create target zones
        levelData.targets.forEach((target, index) => {
            this.createTarget(target, index);
        });

        // Create obstacles if any
        if (levelData.obstacles) {
            levelData.obstacles.forEach(obstacle => {
                this.createObstacle(obstacle);
            });
        }

        console.log(`Level ${levelId} loaded: ${levelData.name}`);
        return true;
    }

    /**
     * Create visual target zone
     */
    createTarget(targetData, index) {
        const geometry = new THREE.CylinderGeometry(
            targetData.size,
            targetData.size,
            0.05,
            32
        );

        const material = new THREE.MeshStandardMaterial({
            color: targetData.color,
            transparent: true,
            opacity: 0.5,
            emissive: targetData.color,
            emissiveIntensity: 0.2
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...targetData.position);
        // mesh.rotation.x = Math.PI / 2; // Removed to make it lie flat (cylinder default is Y-up)
        mesh.userData = {
            isTarget: true,
            targetIndex: index,
            ...targetData
        };

        this.scene.add(mesh);
        this.targetMeshes.push(mesh);
        this.targetStates.push({ filled: false, object: null });
    }

    /**
     * Create obstacle
     */
    createObstacle(obstacleData) {
        const geometry = new THREE.BoxGeometry(
            obstacleData.size,
            obstacleData.size,
            obstacleData.size
        );

        const material = new THREE.MeshStandardMaterial({
            color: obstacleData.color,
            transparent: true,
            opacity: 0.7
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...obstacleData.position);

        this.scene.add(mesh);
        this.obstacleMeshes.push(mesh);
    }

    /**
     * Clear all targets
     */
    clearTargets() {
        this.targetMeshes.forEach(mesh => {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        this.targetMeshes = [];
        this.targetStates = [];
    }

    /**
     * Clear all obstacles
     */
    clearObstacles() {
        this.obstacleMeshes.forEach(mesh => {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        this.obstacleMeshes = [];
    }

    /**
     * Update level (call every frame)
     */
    update() {
        if (!this.isActive || !this.currentLevel) return null;

        // Update elapsed time
        this.elapsedTime = (performance.now() - this.levelStartTime) / 1000;

        // Check time limit
        if (this.currentLevel.timeLimit && this.elapsedTime > this.currentLevel.timeLimit) {
            return { status: 'failed', reason: 'timeout' };
        }

        // Check win conditions
        if (this.checkWinCondition()) {
            const stars = this.calculateStars();
            return {
                status: 'completed',
                time: this.elapsedTime,
                stars: stars
            };
        }

        return { status: 'playing', time: this.elapsedTime };
    }

    /**
     * Check if level is completed
     */
    checkWinCondition() {
        if (!this.currentLevel) return false;

        // Update target states
        this.updateTargetStates();

        // All targets must be filled correctly
        for (let i = 0; i < this.targetMeshes.length; i++) {
            if (!this.targetStates[i].filled) {
                return false;
            }
        }

        return true;
    }

    /**
     * Update which targets have objects
     */
    updateTargetStates() {
        const objects = this.objectManager.getAllObjects();

        // Reset states
        this.targetStates.forEach(state => {
            state.filled = false;
            state.object = null;
        });

        // Check each object against targets
        objects.forEach(obj => {
            for (let i = 0; i < this.targetMeshes.length; i++) {
                const target = this.targetMeshes[i];
                const distance = obj.position.distanceTo(target.position);

                if (distance < target.userData.size) {
                    // Check if object type matches
                    const accepts = target.userData.accepts;
                    if (accepts && accepts.includes(obj.userData.type)) {
                        // Check color if required
                        const requiredColor = target.userData.requiredColor;
                        if (requiredColor) {
                            const objColor = '#' + obj.material.color.getHexString();
                            if (objColor.toLowerCase() !== requiredColor.toLowerCase()) {
                                continue;
                            }
                        }

                        this.targetStates[i].filled = true;
                        this.targetStates[i].object = obj;
                        break;
                    }
                }
            }
        });
    }

    /**
     * Calculate stars based on time
     */
    calculateStars() {
        if (!this.currentLevel || !this.currentLevel.stars) return 1;

        const time = this.elapsedTime;
        const { time: thresholds } = this.currentLevel.stars;

        if (!thresholds) return 1;

        if (time <= thresholds[0]) return 3;
        if (time <= thresholds[1]) return 2;
        if (time <= thresholds[2]) return 1;

        return 1;
    }

    /**
     * Complete current level
     */
    completeLevel() {
        if (!this.currentLevel) return;

        const stars = this.calculateStars();
        const levelId = this.currentLevel.id;

        // Save progress
        this.storage.saveProgress(levelId, stars, this.elapsedTime);

        this.isActive = false;

        return {
            levelId: levelId,
            stars: stars,
            time: this.elapsedTime
        };
    }

    /**
     * Exit level without completing
     */
    exitLevel() {
        this.isActive = false;
        this.currentLevel = null;
        this.clearTargets();
        this.clearObstacles();
        this.objectManager.clearAll();
    }

    /**
     * Get current level info
     */
    getCurrentLevelInfo() {
        if (!this.currentLevel) return null;

        return {
            id: this.currentLevel.id,
            name: this.currentLevel.name,
            description: this.currentLevel.description,
            time: this.elapsedTime,
            timeLimit: this.currentLevel.timeLimit,
            targetsFilled: this.targetStates.filter(s => s.filled).length,
            totalTargets: this.targetStates.length
        };
    }
}
