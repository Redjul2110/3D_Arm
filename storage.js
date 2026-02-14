// Storage - LocalStorage wrapper for persisting game data

class Storage {
    constructor() {
        this.storageKey = '3D_ARM_SIMULATOR';
        this.version = '1.0';
    }

    /**
     * Load all data from localStorage
     */
    loadAll() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed.version === this.version) {
                    return parsed;
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }

        // Return default data structure
        return this.getDefaultData();
    }

    /**
     * Save all data to localStorage
     */
    saveAll(data) {
        try {
            data.version = this.version;
            data.lastUpdated = new Date().toISOString();
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    /**
     * Get default data structure
     */
    getDefaultData() {
        return {
            version: this.version,
            progress: {
                unlockedLevels: [0], // Tutorial unlocked by default
                completedLevels: [],
                levelStars: {}, // { levelId: stars }
                levelBestTimes: {} // { levelId: time }
            },
            animations: [],
            sandboxScenes: [],
            preferences: {
                soundEnabled: true,
                musicEnabled: true,
                difficulty: 'normal'
            }
        };
    }

    /**
     * Save level progress
     */
    saveProgress(levelId, stars, time) {
        const data = this.loadAll();

        // Update stars (only if better)
        if (!data.progress.levelStars[levelId] || data.progress.levelStars[levelId] < stars) {
            data.progress.levelStars[levelId] = stars;
        }

        // Update best time (only if faster)
        if (!data.progress.levelBestTimes[levelId] || data.progress.levelBestTimes[levelId] > time) {
            data.progress.levelBestTimes[levelId] = time;
        }

        // Mark as completed
        if (!data.progress.completedLevels.includes(levelId)) {
            data.progress.completedLevels.push(levelId);
        }

        // Unlock next level
        const nextLevelId = levelId + 1;
        if (nextLevelId <= 10 && !data.progress.unlockedLevels.includes(nextLevelId)) {
            data.progress.unlockedLevels.push(nextLevelId);
        }

        this.saveAll(data);
        return data.progress;
    }

    /**
     * Load progress
     */
    loadProgress() {
        const data = this.loadAll();
        return data.progress;
    }

    /**
     * Save animation
     */
    saveAnimation(name, animationData) {
        const data = this.loadAll();

        const animation = {
            name: name,
            data: animationData,
            created: new Date().toISOString()
        };

        // Check if animation with this name exists
        const existingIndex = data.animations.findIndex(a => a.name === name);
        if (existingIndex >= 0) {
            data.animations[existingIndex] = animation;
        } else {
            data.animations.push(animation);
        }

        this.saveAll(data);
        return true;
    }

    /**
     * Load all animations
     */
    loadAnimations() {
        const data = this.loadAll();
        return data.animations;
    }

    /**
     * Delete animation
     */
    deleteAnimation(name) {
        const data = this.loadAll();
        data.animations = data.animations.filter(a => a.name !== name);
        this.saveAll(data);
    }

    /**
     * Save sandbox scene
     */
    saveSandbox(name, sceneData) {
        const data = this.loadAll();

        const scene = {
            name: name,
            data: sceneData,
            created: new Date().toISOString()
        };

        const existingIndex = data.sandboxScenes.findIndex(s => s.name === name);
        if (existingIndex >= 0) {
            data.sandboxScenes[existingIndex] = scene;
        } else {
            data.sandboxScenes.push(scene);
        }

        this.saveAll(data);
        return true;
    }

    /**
     * Load sandbox scenes
     */
    loadSandboxScenes() {
        const data = this.loadAll();
        return data.sandboxScenes;
    }

    /**
     * Export all data as JSON file
     */
    exportAll() {
        const data = this.loadAll();
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `3d-arm-backup-${Date.now()}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }

    /**
     * Import data from JSON
     */
    importAll(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            if (data.version && data.progress) {
                this.saveAll(data);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    /**
     * Reset all data
     */
    resetAll() {
        localStorage.removeItem(this.storageKey);
        return this.getDefaultData();
    }
}

export { Storage };
