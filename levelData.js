// Level Data - 10 Progressive Challenge Levels + Tutorial

export const LEVELS = [
    // Tutorial
    {
        id: 0,
        name: "Tutorial: Erste Schritte",
        description: "Lerne die Grundlagen! Nimm den Würfel auf und platziere ihn auf dem Ziel.",
        difficulty: "tutorial",
        objects: [
            { type: 'cube', position: [2, 0.15, 0], color: '#ff6b35', size: 0.3 }
        ],
        targets: [
            { position: [-2, 0.15, 0], size: 0.5, accepts: ['cube'], color: '#00ff00' }
        ],
        timeLimit: null,
        moveLimit: null,
        hint: "Bewege den Arm zum Würfel, schließe den Greifer, bringe ihn zum grünen Ziel, öffne den Greifer."
    },

    // Level 1: Basic Pickup
    {
        id: 1,
        name: "Level 1: Aufnehmen & Ablegen",
        description: "Platziere den orangenen Würfel auf dem Ziel.",
        difficulty: "easy",
        objects: [
            { type: 'cube', position: [1.5, 0.15, 1], color: '#ff6b35', size: 0.3 }
        ],
        targets: [
            { position: [-1.5, 0.15, -1], size: 0.5, accepts: ['cube'], color: '#00ff00' }
        ],
        timeLimit: 120,
        moveLimit: null,
        instruction: "Willkommen! \n1. Bewege den Arm mit den Reglern.\n2. Positioniere den Greifer über dem orangenen Würfel.\n3. Schließe den Greifer, um ihn aufzunehmen.\n4. Lege ihn auf der grünen Fläche ab.",
        stars: {
            time: [60, 90, 120] // 3 stars, 2 stars, 1 star
        }
    },

    // Level 2: Two Objects
    {
        id: 2,
        name: "Level 2: Doppelte Arbeit",
        description: "Transportiere beide Würfel zu ihren Zielen.",
        difficulty: "easy",
        objects: [
            { type: 'cube', position: [2, 0.15, 0], color: '#ff6b35', size: 0.3 },
            { type: 'cube', position: [2, 0.15, 2], color: '#ff4757', size: 0.3 }
        ],
        targets: [
            { position: [-2, 0.15, 0], size: 0.5, accepts: ['cube'], color: '#00ff00' },
            { position: [-2, 0.15, 2], size: 0.5, accepts: ['cube'], color: '#00ff00' }
        ],
        timeLimit: 180,
        moveLimit: null,
        stars: {
            time: [90, 130, 180]
        }
    },

    // Level 3: Precision
    {
        id: 3,
        name: "Level 3: Präzision",
        description: "Platziere die Kugel genau auf dem kleinen Ziel.",
        difficulty: "medium",
        objects: [
            { type: 'sphere', position: [2.5, 0.2, 0], color: '#ffa502', size: 0.2 }
        ],
        targets: [
            { position: [-2.5, 0.2, 0], size: 0.3, accepts: ['sphere'], color: '#00ff00' }
        ],
        timeLimit: 90,
        moveLimit: null,
        stars: {
            time: [45, 65, 90]
        }
    },

    // Level 4: Color Sorting
    {
        id: 4,
        name: "Level 4: Farbsortierung",
        description: "Sortiere die Würfel nach Farbe - Orange zu Orange, Rot zu Rot.",
        difficulty: "medium",
        objects: [
            { type: 'cube', position: [1, 0.15, 1], color: '#ff6b35', size: 0.3 },
            { type: 'cube', position: [2, 0.15, -1], color: '#ff4757', size: 0.3 },
            { type: 'cube', position: [1.5, 0.15, 0], color: '#ff6b35', size: 0.3 }
        ],
        targets: [
            { position: [-2, 0.15, 1], size: 0.5, accepts: ['cube'], requiredColor: '#ff6b35', color: '#ff6b35' },
            { position: [-1, 0.15, 1], size: 0.5, accepts: ['cube'], requiredColor: '#ff6b35', color: '#ff6b35' },
            { position: [-2, 0.15, -1], size: 0.5, accepts: ['cube'], requiredColor: '#ff4757', color: '#ff4757' }
        ],
        timeLimit: 200,
        moveLimit: null,
        stars: {
            time: [100, 150, 200]
        }
    },

    // Level 5: Shape Sorting
    {
        id: 5,
        name: "Level 5: Formsortierung",
        description: "Würfel zu Würfeln, Kugeln zu Kugeln!",
        difficulty: "medium",
        objects: [
            { type: 'cube', position: [2, 0.15, 1], color: '#ff6b35', size: 0.3 },
            { type: 'sphere', position: [2, 0.2, -1], color: '#ff4757', size: 0.2 },
            { type: 'cube', position: [2, 0.15, 0], color: '#ffa502', size: 0.3 },
            { type: 'sphere', position: [1, 0.2, 0], color: '#ff6348', size: 0.2 }
        ],
        targets: [
            { position: [-2, 0.15, 1], size: 0.5, accepts: ['cube'], color: '#0088ff' },
            { position: [-2, 0.15, 0], size: 0.5, accepts: ['cube'], color: '#0088ff' },
            { position: [-2, 0.2, -1], size: 0.4, accepts: ['sphere'], color: '#ff00ff' },
            { position: [-1, 0.2, -1], size: 0.4, accepts: ['sphere'], color: '#ff00ff' }
        ],
        timeLimit: 240,
        moveLimit: null,
        stars: {
            time: [120, 180, 240]
        }
    },

    // Level 6: Stacking
    {
        id: 6,
        name: "Level 6: Stapeln",
        description: "Stapel 3 Würfel übereinander!",
        difficulty: "hard",
        objects: [
            { type: 'cube', position: [2, 0.15, 0], color: '#ff6b35', size: 0.3 },
            { type: 'cube', position: [2, 0.15, 1], color: '#ff4757', size: 0.3 },
            { type: 'cube', position: [2, 0.15, -1], color: '#ffa502', size: 0.3 }
        ],
        targets: [
            { position: [-2, 0.15, 0], size: 0.5, accepts: ['cube'], color: '#00ff00', stackable: true },
            { position: [-2, 0.45, 0], size: 0.5, accepts: ['cube'], color: '#00ff00', stackable: true },
            { position: [-2, 0.75, 0], size: 0.5, accepts: ['cube'], color: '#00ff00', stackable: true }
        ],
        timeLimit: 300,
        moveLimit: null,
        stars: {
            time: [150, 225, 300]
        }
    },

    // Level 7: Obstacles
    {
        id: 7,
        name: "Level 7: Hindernisparcours",
        description: "Navigiere um die Hindernisse herum!",
        difficulty: "hard",
        objects: [
            { type: 'cube', position: [3, 0.15, 0], color: '#ff6b35', size: 0.3 }
        ],
        obstacles: [
            { position: [1, 1, 0], size: 0.5, color: '#ff0000' },
            { position: [-1, 1.5, 0], size: 0.5, color: '#ff0000' }
        ],
        targets: [
            { position: [-3, 0.15, 0], size: 0.5, accepts: ['cube'], color: '#00ff00' }
        ],
        timeLimit: 180,
        moveLimit: null,
        stars: {
            time: [90, 135, 180]
        }
    },

    // Level 8: Speed Challenge
    {
        id: 8,
        name: "Level 8: Geschwindigkeit",
        description: "Schnell! Sortiere alle 4 Objekte in 120 Sekunden!",
        difficulty: "hard",
        objects: [
            { type: 'cube', position: [2.5, 0.15, 1.5], color: '#ff6b35', size: 0.3 },
            { type: 'sphere', position: [2.5, 0.2, -1.5], color: '#ff4757', size: 0.2 },
            { type: 'cube', position: [1.5, 0.15, 0], color: '#ff6b35', size: 0.3 },
            { type: 'sphere', position: [2, 0.2, 1], color: '#ff4757', size: 0.2 }
        ],
        targets: [
            { position: [-2, 0.15, 1], size: 0.5, accepts: ['cube'], color: '#0088ff' },
            { position: [-2, 0.15, 0], size: 0.5, accepts: ['cube'], color: '#0088ff' },
            { position: [-2, 0.2, -1], size: 0.4, accepts: ['sphere'], color: '#ff00ff' },
            { position: [-1, 0.2, -1], size: 0.4, accepts: ['sphere'], color: '#ff00ff' }
        ],
        timeLimit: 120,
        moveLimit: null,
        stars: {
            time: [60, 90, 120]
        }
    },

    // Level 9: Complex Sequence
    {
        id: 9,
        name: "Level 9: Komplexes Puzzle",
        description: "Sortiere nach Farbe UND Form in der richtigen Reihenfolge!",
        difficulty: "expert",
        objects: [
            { type: 'cube', position: [2, 0.15, 2], color: '#ff6b35', size: 0.3 },
            { type: 'sphere', position: [2, 0.2, 1], color: '#ff6b35', size: 0.2 },
            { type: 'cube', position: [2, 0.15, 0], color: '#ff4757', size: 0.3 },
            { type: 'sphere', position: [2, 0.2, -1], color: '#ff4757', size: 0.2 },
            { type: 'cube', position: [2, 0.15, -2], color: '#ffa502', size: 0.3 }
        ],
        targets: [
            { position: [-2, 0.15, 2], size: 0.5, accepts: ['cube'], requiredColor: '#ff6b35', color: '#ff6b35' },
            { position: [-2, 0.2, 1], size: 0.4, accepts: ['sphere'], requiredColor: '#ff6b35', color: '#ff6b35' },
            { position: [-2, 0.15, 0], size: 0.5, accepts: ['cube'], requiredColor: '#ff4757', color: '#ff4757' },
            { position: [-2, 0.2, -1], size: 0.4, accepts: ['sphere'], requiredColor: '#ff4757', color: '#ff4757' },
            { position: [-2, 0.15, -2], size: 0.5, accepts: ['cube'], requiredColor: '#ffa502', color: '#ffa502' }
        ],
        timeLimit: 300,
        moveLimit: null,
        stars: {
            time: [150, 225, 300]
        }
    },

    // Level 10: Master Challenge
    {
        id: 10,
        name: "Level 10: Meister-Challenge",
        description: "Die ultimative Herausforderung! Zeig was du gelernt hast!",
        difficulty: "master",
        objects: [
            { type: 'cube', position: [3, 0.15, 2], color: '#ff6b35', size: 0.3 },
            { type: 'sphere', position: [3, 0.2, 1], color: '#ff4757', size: 0.2 },
            { type: 'cube', position: [3, 0.15, 0], color: '#ffa502', size: 0.3 },
            { type: 'sphere', position: [3, 0.2, -1], color: '#ff6348', size: 0.2 },
            { type: 'cube', position: [3, 0.15, -2], color: '#ff6b35', size: 0.3 },
            { type: 'sphere', position: [2, 0.2, 0], color: '#ff4757', size: 0.2 }
        ],
        targets: [
            // Stack cubes
            { position: [-3, 0.15, 1], size: 0.5, accepts: ['cube'], requiredColor: '#ff6b35', color: '#ff6b35', stackable: true },
            { position: [-3, 0.45, 1], size: 0.5, accepts: ['cube'], requiredColor: '#ff6b35', color: '#ff6b35', stackable: true },
            { position: [-3, 0.15, 0], size: 0.5, accepts: ['cube'], requiredColor: '#ffa502', color: '#ffa502' },
            // Spheres sorted
            { position: [-3, 0.2, -1], size: 0.4, accepts: ['sphere'], requiredColor: '#ff4757', color: '#ff4757' },
            { position: [-2, 0.2, -1], size: 0.4, accepts: ['sphere'], requiredColor: '#ff4757', color: '#ff4757' },
            { position: [-3, 0.2, -2], size: 0.4, accepts: ['sphere'], requiredColor: '#ff6348', color: '#ff6348' }
        ],
        timeLimit: 360,
        moveLimit: null,
        stars: {
            time: [180, 270, 360]
        }
    }
];

export function getLevelById(id) {
    return LEVELS.find(level => level.id === id);
}

export function getTotalLevels() {
    return LEVELS.length;
}
