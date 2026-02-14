// Main Application Logic

import { RobotArmSimulator } from './robotArm.js';
import { LEVELS } from './levelData.js';
import { Storage } from './storage.js';

class App {
    constructor() {
        this.currentScreen = 'home';
        this.robotSimulator = null;
        this.storage = new Storage();

        this.init();
    }

    init() {
        this.setupEventListeners();

        // Listen for level completion
        window.addEventListener('levelCompleted', (e) => {
            this.handleLevelCompletion(e.detail);
        });

        // 3D Tilt Effect for Hero Card
        const heroCard = document.querySelector('.hero-card');
        const homeContent = document.querySelector('.home-content');

        if (heroCard && homeContent) {
            homeContent.addEventListener('mousemove', (e) => {
                const rect = heroCard.getBoundingClientRect();
                const x = e.clientX - rect.left; // x position within the element.
                const y = e.clientY - rect.top;  // y position within the element.

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -3; // Max rotation deg
                const rotateY = ((x - centerX) / centerX) * 3;

                heroCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            homeContent.addEventListener('mouseleave', () => {
                heroCard.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            });
        }
    }

    setupEventListeners() {
        // Start Simulator Button (Menu Card)
        const startBtn = document.getElementById('startSimulator');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startManualMode());
        }

        // Start Simulator Button (Main Play Button)
        const mainStartBtn = document.getElementById('startSimulatorMain');
        if (mainStartBtn) {
            mainStartBtn.addEventListener('click', () => this.startManualMode());
        }

        // Challenge Levels Button
        const levelsBtn = document.getElementById('startLevels');
        if (levelsBtn) {
            levelsBtn.addEventListener('click', () => this.showLevels());
        }

        // Back to Home Button
        const backBtn = document.getElementById('backToHome');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.showHome());
        }

        // Back from Levels Button
        const backLevelsBtn = document.getElementById('backFromLevels');
        if (backLevelsBtn) {
            backLevelsBtn.addEventListener('click', () => {
                document.getElementById('levelScreen').classList.remove('active');
                document.getElementById('homeScreen').classList.add('active');
            });
        }

        // Reset Position Button
        const resetBtn = document.getElementById('resetPosition');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetRobotPosition());
        }

        // Object Spawning Buttons
        const spawnCubeBtn = document.getElementById('spawnCube');
        if (spawnCubeBtn) {
            spawnCubeBtn.addEventListener('click', () => this.spawnObject('cube'));
        }

        const spawnSphereBtn = document.getElementById('spawnSphere');
        if (spawnSphereBtn) {
            spawnSphereBtn.addEventListener('click', () => this.spawnObject('sphere'));
        }

        const spawnCylinderBtn = document.getElementById('spawnCylinder');
        if (spawnCylinderBtn) {
            spawnCylinderBtn.addEventListener('click', () => this.spawnObject('cylinder'));
        }

        const clearObjectsBtn = document.getElementById('clearObjects');
        if (clearObjectsBtn) {
            clearObjectsBtn.addEventListener('click', () => this.clearAllObjects());
        }
        // Joint Control Sliders
        this.setupJointControls();
    }

    setupJointControls() {
        const controls = [
            { id: 'baseRotation', joint: 'base', valueId: 'baseValue' },
            { id: 'shoulder', joint: 'shoulder', valueId: 'shoulderValue' },
            { id: 'elbow', joint: 'elbow', valueId: 'elbowValue' },
            { id: 'wristPitch', joint: 'wristPitch', valueId: 'wristPitchValue' },
            { id: 'wristRoll', joint: 'wristRoll', valueId: 'wristRollValue' },
            { id: 'gripper', joint: 'gripper', valueId: 'gripperValue' }
        ];

        controls.forEach(control => {
            const slider = document.getElementById(control.id);
            const valueDisplay = document.getElementById(control.valueId);

            if (slider && valueDisplay) {
                // Initial value
                valueDisplay.textContent = slider.value + '°';

                // Update on input
                slider.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    valueDisplay.textContent = value + '°';

                    if (this.robotSimulator) {
                        this.robotSimulator.updateJoints({
                            [control.joint]: value
                        });
                    }
                });
            }
        });
    }

    startManualMode() {
        this.initializeSimulator();

        // Transition screens
        document.getElementById('homeScreen').classList.remove('active');
        document.getElementById('simulatorScreen').classList.add('active');

        this.currentScreen = 'manual';
    }

    showLevels() {
        const levelsGrid = document.getElementById('levelsGrid');
        if (!levelsGrid) return;

        // Load progress
        const progress = this.storage.loadProgress();
        const completedLevels = progress.completedLevels || [];
        const unlockedLevels = progress.unlockedLevels || [0];
        const stars = progress.levelStars || {};

        levelsGrid.innerHTML = '';

        LEVELS.forEach(level => {
            const isUnlocked = unlockedLevels.includes(level.id);
            const isCompleted = completedLevels.includes(level.id);
            const starCount = stars[level.id] || 0;

            const card = document.createElement('div');
            card.className = `level-card ${isUnlocked ? '' : 'locked'}`;

            // Stars HTML
            let starsHtml = '';
            for (let i = 0; i < 3; i++) {
                starsHtml += i < starCount ? '⭐' : '☆';
            }

            card.innerHTML = `
                <div class="level-number">${level.id}</div>
                <div class="level-name">${level.name}</div>
                <div class="level-stars">${isUnlocked ? starsHtml : 'Locked'}</div>
            `;

            if (isUnlocked) {
                card.addEventListener('click', () => this.startLevel(level.id));
            }

            levelsGrid.appendChild(card);
        });

        document.getElementById('homeScreen').classList.remove('active');
        document.getElementById('levelScreen').classList.add('active');
    }

    startLevel(levelId) {
        this.initializeSimulator();

        // Load the level
        // Load the level
        if (this.robotSimulator.levelManager) {
            this.robotSimulator.levelManager.loadLevel(levelId);
        }

        // Transition screens
        document.getElementById('levelScreen').classList.remove('active');
        document.getElementById('simulatorScreen').classList.add('active');

        this.currentScreen = 'level';

        // Show Instruction
        if (this.robotSimulator.levelManager && this.robotSimulator.levelManager.currentLevel) {
            const level = this.robotSimulator.levelManager.currentLevel;
            if (level.instruction) {
                setTimeout(() => {
                    alert(level.instruction);
                }, 500);
            }
        }
    }

    initializeSimulator() {
        // Initialize robot simulator if not exists
        if (!this.robotSimulator) {
            this.robotSimulator = new RobotArmSimulator();
            this.robotSimulator.init();
        }
    }

    showHome() {
        // Show home screen
        const homeScreen = document.getElementById('homeScreen');
        const simulatorScreen = document.getElementById('simulatorScreen');

        simulatorScreen.classList.remove('active');
        homeScreen.classList.add('active');

        this.currentScreen = 'home';

        // Exit any active level
        if (this.robotSimulator && this.robotSimulator.levelManager) {
            this.robotSimulator.levelManager.exitLevel();
        }

        // Dispose robot simulator to save resources? 
        // For now, keep it alive to avoid re-initialization lag
        if (this.robotSimulator) {
            this.robotSimulator.dispose();
            this.robotSimulator = null;
        }
    }

    resetRobotPosition() {
        if (this.robotSimulator) {
            this.robotSimulator.resetPosition();
            this.updateSliders();
        }
    }

    updateSliders() {
        // Reset all slider values in UI
        const sliders = [
            { id: 'baseRotation', valueId: 'baseValue' },
            { id: 'shoulder', valueId: 'shoulderValue' },
            { id: 'elbow', valueId: 'elbowValue' },
            { id: 'wristPitch', valueId: 'wristPitchValue' },
            { id: 'wristRoll', valueId: 'wristRollValue' },
            { id: 'gripper', valueId: 'gripperValue' }
        ];

        sliders.forEach(slider => {
            const element = document.getElementById(slider.id);
            const valueDisplay = document.getElementById(slider.valueId);

            if (element && valueDisplay) {
                element.value = 0;
                valueDisplay.textContent = '0°';
            }
        });
    }

    spawnObject(type) {
        if (this.robotSimulator && this.robotSimulator.objectManager) {
            // Get coordinates from inputs
            const xInput = document.getElementById('spawnX');
            const yInput = document.getElementById('spawnY');
            const zInput = document.getElementById('spawnZ');

            let x = 2;
            let y = 0.2;
            let z = 0;

            if (xInput && yInput && zInput) {
                x = parseFloat(xInput.value) || 2;
                y = parseFloat(yInput.value) || 0.2;
                z = parseFloat(zInput.value) || 0;
            } else {
                // Fallback to random if inputs missing
                x = (Math.random() - 0.5) * 4;
                z = (Math.random() - 0.5) * 4;
            }

            // Random color from theme
            const colors = ['#ff6b35', '#ff4757', '#ffa502', '#ff6348'];
            const color = colors[Math.floor(Math.random() * colors.length)];

            this.robotSimulator.objectManager.spawnObject(
                type,
                new THREE.Vector3(x, y, z),
                color,
                0.3
            );
        }
    }

    clearAllObjects() {
        if (this.robotSimulator) {
            this.robotSimulator.clearObjects();
        }
    }

    // Animation control methods
    recordKeyframe() {
        if (this.robotSimulator && this.robotSimulator.animationSystem) {
            const currentTime = this.robotSimulator.animationSystem.currentTime;
            const angles = { ...this.robotSimulator.angles };

            this.robotSimulator.animationSystem.addKeyframe(currentTime, angles);
            this.updateTimelineUI();

            console.log(`Keyframe recorded at ${currentTime.toFixed(2)}s`);
        }
    }

    // Seek animation logic
    seekAnimation(time) {
        if (this.robotSimulator && this.robotSimulator.animationSystem) {
            this.robotSimulator.animationSystem.currentTime = time;

            // Update robot pose immediately
            const angles = this.robotSimulator.animationSystem.update();
            if (angles) {
                this.robotSimulator.updateJoints(angles);
            }
            this.updateTimelineUI();
        }
    }

    playAnimation() {
        if (this.robotSimulator && this.robotSimulator.animationSystem) {
            this.robotSimulator.animationSystem.play();
            this.startTimelineUpdate();
        }
    }

    pauseAnimation() {
        if (this.robotSimulator && this.robotSimulator.animationSystem) {
            this.robotSimulator.animationSystem.pause();
        }
    }

    stopAnimation() {
        if (this.robotSimulator && this.robotSimulator.animationSystem) {
            this.robotSimulator.animationSystem.stop();
            this.updateTimelineUI();
        }
    }

    clearAnimation() {
        if (this.robotSimulator && this.robotSimulator.animationSystem) {
            this.robotSimulator.animationSystem.clearAllKeyframes();
            this.updateTimelineUI();
        }
    }

    // Update visual timeline
    updateTimelineUI() {
        if (!this.robotSimulator || !this.robotSimulator.animationSystem) return;

        const container = document.getElementById('keyframeContainer');
        const marker = document.getElementById('timelineMarker');
        const track = document.querySelector('.timeline-track');

        // Add seek listener to track if not already there (simple check)
        if (track && !track.hasAttribute('data-listening')) {
            track.setAttribute('data-listening', 'true');
            track.addEventListener('click', (e) => {
                const rect = track.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percent = Math.max(0, Math.min(1, x / rect.width));
                const duration = this.robotSimulator.animationSystem.duration || 10;

                this.seekAnimation(percent * duration);
            });
            track.style.cursor = 'pointer';
        }

        if (!container) return;

        // Clear existing keyframe markers
        container.innerHTML = '';

        // Add keyframe markers
        const keyframes = this.robotSimulator.animationSystem.getAllKeyframes();
        const duration = this.robotSimulator.animationSystem.duration || 10;

        keyframes.forEach((kf, index) => {
            const markerEl = document.createElement('div');
            markerEl.className = 'keyframe-marker';
            markerEl.style.left = (kf.time / duration * 100) + '%';
            markerEl.title = `${kf.time.toFixed(2)}s`;

            // Click to remove keyframe - stop propagation to prevent seek
            markerEl.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Keyframe löschen?')) {
                    this.robotSimulator.animationSystem.removeKeyframe(index);
                    this.updateTimelineUI();
                }
            });

            container.appendChild(markerEl);
        });

        // Update playhead position
        if (marker) {
            const progress = this.robotSimulator.animationSystem.getProgress();
            marker.style.left = (progress * 100) + '%';
        }
    }

    // Start timeline update loop
    startTimelineUpdate() {
        const updateLoop = () => {
            if (this.robotSimulator && this.robotSimulator.animationSystem &&
                this.robotSimulator.animationSystem.playing) {
                this.updateTimelineUI();
                requestAnimationFrame(updateLoop);
            }
        };
        updateLoop();
    }

    // Start timeline update loop
    startTimelineUpdate() {
        const updateLoop = () => {
            if (this.robotSimulator && this.robotSimulator.animationSystem &&
                this.robotSimulator.animationSystem.playing) {
                this.updateTimelineUI();
                requestAnimationFrame(updateLoop);
            }
        };
        updateLoop();
    }

    handleLevelCompletion(result) {
        // Show completion modal or alert
        // For now simple alert and return to menu option
        setTimeout(() => {
            if (confirm(`Level Complete! \nTime: ${result.time.toFixed(1)}s\nStars: ${result.stars} ⭐\n\nNext Level?`)) {
                // Return to level selection to pick next
                this.showHome(); // Cleanup
                this.showLevels(); // Show levels
            } else {
                this.showHome();
            }
        }, 500);
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new App();
    });
} else {
    new App();
}
