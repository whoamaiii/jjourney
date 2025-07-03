/**
 * Level 1 - Whispering Clearing
 * A tutorial-friendly forest level with four micro-biomes
 * 
 * Structure:
 * 1. Spawn Glade - Safe hub with mentor's rune stone
 * 2. Canopy Pass - Vertical movement tutorial with vines
 * 3. Tricklebrook - Combat introduction with water mechanics
 * 4. Elder Oak Atrium - Mini-boss arena
 */

const LEVEL1_CONFIG = {
    name: 'Whispering Clearing',
    width: 120, // tiles
    height: 30, // tiles
    tileSize: 32,
    
    // Asset references
    assets: {
        tileset: 'oak_woods_tileset',
        backgrounds: ['forest_parallax_1', 'forest_parallax_2', 'forest_parallax_3'],
        music: 'forest_ambience.mp3'
    },
    
    // Micro-biome definitions
    biomes: {
        spawnGlade: {
            startX: 0,
            endX: 30,
            description: 'Safe starting area with tutorial prompts',
            features: ['mentor_runestone', 'movement_tutorial', 'parallax_oaks']
        },
        canopyPass: {
            startX: 30,
            endX: 60,
            description: 'Vertical climbing section with vine mechanics',
            features: ['vine_ladders', 'collapsible_branches', 'height_challenge']
        },
        tricklebrook: {
            startX: 60,
            endX: 90,
            description: 'Water area with first combat encounters',
            features: ['shallow_water', 'bridge', 'sproutling_enemy', 'foraging_boar']
        },
        elderOakAtrium: {
            startX: 90,
            endX: 120,
            description: 'Circular arena for mini-boss fight',
            features: ['giant_tree_backdrop', 'root_pillars', 'mutated_sproutling_boss']
        }
    },
    
    // Enemy configurations
    enemies: {
        sproutling: {
            sprite: 'vine_turret',
            health: 2,
            damage: 1,
            attacks: ['seed_shot', 'vine_whip'],
            behavior: 'stationary_ranged',
            dropRate: 0.3
        },
        foragingBoar: {
            sprite: 'wild_boar',
            health: 3,
            damage: 2,
            attacks: ['charge', 'root_dig'],
            behavior: 'patrol_charge',
            dropRate: 0.5
        },
        mutatedSproutling: {
            sprite: 'vine_turret_boss',
            health: 10,
            damage: 2,
            attacks: ['seed_barrage', 'spore_burst', 'vine_slam'],
            behavior: 'boss_pattern',
            phases: 2
        }
    },
    
    // Tutorial triggers
    tutorials: {
        movement: {
            trigger: { x: 5, y: 20 },
            message: 'Use arrow keys to move, SPACE to jump'
        },
        climbing: {
            trigger: { x: 35, y: 15 },
            message: 'Press UP near vines to climb'
        },
        combat: {
            trigger: { x: 65, y: 20 },
            message: 'Press Z to attack, X to dodge-roll'
        },
        parry: {
            trigger: { x: 70, y: 20 },  
            message: 'Hold SHIFT to block incoming attacks'
        }
    },
    
    // Collectibles and rewards
    collectibles: {
        cleanseSaplings: [
            { x: 40, y: 18, id: 'sapling_1' },
            { x: 75, y: 22, id: 'sapling_2' },
            { x: 85, y: 15, id: 'sapling_3' }
        ],
        herbalistSatchel: {
            x: 115, y: 20,
            unlocks: 'crafting_ui',
            contents: ['healing_herb', 'stamina_root', 'barrier_moss']
        }
    },
    
    // Environmental hazards
    hazards: {
        collapsingBranches: [
            { x: 45, y: 12, collapseDelay: 1000 },
            { x: 48, y: 10, collapseDelay: 800 },
            { x: 52, y: 8, collapseDelay: 1200 }
        ],
        waterCurrent: {
            zones: [
                { startX: 62, endX: 68, force: -0.3 },
                { startX: 72, endX: 78, force: 0.3 }
            ]
        }
    }
};

// Level generation functions
function generateLevel1Tiles() {
    const tiles = [];
    const { width, height } = LEVEL1_CONFIG;
    
    // Initialize empty level
    for (let y = 0; y < height; y++) {
        tiles[y] = new Array(width).fill(0);
    }
    
    // Generate each biome
    generateSpawnGlade(tiles);
    generateCanopyPass(tiles);
    generateTricklebrook(tiles);
    generateElderOakAtrium(tiles);
    
    return tiles;
}

function generateSpawnGlade(tiles) {
    const { startX, endX } = LEVEL1_CONFIG.biomes.spawnGlade;
    const groundY = 25;
    
    // Flat grassy ground
    for (let x = startX; x < endX; x++) {
        for (let y = groundY; y < 30; y++) {
            tiles[y][x] = TILES.GRASS;
        }
    }
    
    // Mentor's runestone platform
    for (let x = 5; x < 10; x++) {
        tiles[groundY - 1][x] = TILES.STONE_PLATFORM;
    }
    
    // Add some decorative trees
    placeTree(tiles, 15, groundY);
    placeTree(tiles, 22, groundY);
}

function generateCanopyPass(tiles) {
    const { startX, endX } = LEVEL1_CONFIG.biomes.canopyPass;
    
    // Create ascending platforms
    let currentHeight = 25;
    for (let x = startX; x < endX; x += 5) {
        currentHeight = Math.max(10, currentHeight - 1);
        
        // Platform
        for (let px = x; px < Math.min(x + 4, endX); px++) {
            tiles[currentHeight][px] = TILES.WOOD_PLATFORM;
        }
        
        // Vine ladder on every other platform
        if ((x - startX) % 10 === 0) {
            for (let y = currentHeight + 1; y < 30; y++) {
                tiles[y][x] = TILES.VINE_LADDER;
            }
        }
    }
    
    // Add collapsing branches
    LEVEL1_CONFIG.hazards.collapsingBranches.forEach(branch => {
        tiles[branch.y][branch.x] = TILES.CRUMBLING_BRANCH;
    });
}

function generateTricklebrook(tiles) {
    const { startX, endX } = LEVEL1_CONFIG.biomes.tricklebrook;
    const waterLevel = 26;
    
    // Create brook with shallow water
    for (let x = startX + 5; x < endX - 5; x++) {
        tiles[waterLevel][x] = TILES.SHALLOW_WATER;
        tiles[waterLevel + 1][x] = TILES.WATER;
        tiles[waterLevel + 2][x] = TILES.WATER_DEEP;
    }
    
    // Bridge across the water
    const bridgeStart = startX + 20;
    for (let x = bridgeStart; x < bridgeStart + 8; x++) {
        tiles[waterLevel - 1][x] = TILES.WOOD_BRIDGE;
    }
    
    // Stepping stones
    const stonePositions = [startX + 10, startX + 15, startX + 30, startX + 35];
    stonePositions.forEach(x => {
        tiles[waterLevel][x] = TILES.STONE_PLATFORM;
    });
}

function generateElderOakAtrium(tiles) {
    const { startX, endX } = LEVEL1_CONFIG.biomes.elderOakAtrium;
    const centerX = (startX + endX) / 2;
    const groundY = 25;
    
    // Circular arena floor
    const radius = 15;
    for (let x = startX; x < endX; x++) {
        for (let y = groundY; y < 30; y++) {
            const dist = Math.abs(x - centerX);
            if (dist < radius) {
                tiles[y][x] = TILES.ARENA_FLOOR;
            }
        }
    }
    
    // Root pillars for cover
    const pillarPositions = [centerX - 8, centerX, centerX + 8];
    pillarPositions.forEach(x => {
        for (let y = groundY - 3; y < groundY; y++) {
            tiles[y][x] = TILES.ROOT_PILLAR;
        }
    });
    
    // Boss spawn point marker
    tiles[groundY - 1][centerX] = TILES.BOSS_SPAWN;
}

// Helper functions
function placeTree(tiles, x, groundY) {
    // Simple tree structure
    for (let y = groundY - 6; y < groundY; y++) {
        tiles[y][x] = TILES.TREE_TRUNK;
    }
    // Canopy
    for (let dy = -8; dy <= -6; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
            if (tiles[groundY + dy] && tiles[groundY + dy][x + dx] !== undefined) {
                tiles[groundY + dy][x + dx] = TILES.LEAVES;
            }
        }
    }
}

// Tile type definitions
const TILES = {
    EMPTY: 0,
    GRASS: 1,
    STONE_PLATFORM: 2,
    WOOD_PLATFORM: 3,
    VINE_LADDER: 4,
    CRUMBLING_BRANCH: 5,
    SHALLOW_WATER: 6,
    WATER: 7,
    WATER_DEEP: 8,
    WOOD_BRIDGE: 9,
    ARENA_FLOOR: 10,
    ROOT_PILLAR: 11,
    TREE_TRUNK: 12,
    LEAVES: 13,
    BOSS_SPAWN: 14
};

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LEVEL1_CONFIG, generateLevel1Tiles, TILES };
} 