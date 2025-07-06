// --- Core Game Variables ---
let player;
let level;
let camera;
let tileset;
let playerSprite;
let crystals;
let score;
let enemies;
let powerUps;
let particles = [];
let isInSecretZone = false;
let crumblingBlocks = [];
let checkpoint = { x: 0, y: 0 };
let levelComplete = false;
let waterfallAnimFrame = 0;
let gameState = 'mainMenu';
let bgMusic;
let playerTrail = [];

// --- Global system variables ---
let visualEffects;
let tutorialSystem;

// --- NEW: Animation frame storage ---
let animationFrames = {
    idle: [],
    walk: [],
    run: [],
    jump: []
};

// --- Tile Definitions (for procedural tileset) ---
const TILE_DEFS = {
    GROUND: { x: 0, y: 0 },
    WATER: { x: 0, y: 32 },
    WATERFALL: [ // Animation frames
        { x: 32, y: 32 },
        { x: 64, y: 32 },
    ],
    CRUMBLING: { x: 96, y: 0 },
    DEEP_WATER: { x: 64, y: 64 },
    CRYSTAL: { x: 64, y: 0 },
    SUNSTONE: { x: 96, y: 0 },
    ENEMY_SLUG: [ // Animation frames
        { x: 0, y: 64 },
        { x: 32, y: 64 },
    ]
};

// --- Sound Variables ---
let jumpSound, collectSound, stompSound, powerupSound, winSound;

// --- Game Constants ---
const TILE_SIZE = 32;
const LEVEL_WIDTH_TILES = 100;
const LEVEL_HEIGHT_TILES = 20;
const GRAVITY = 0.8;
const JUMP_FORCE = -14;
const MOVE_SPEED = 6;
const WATER_SPEED_MODIFIER = 0.5;
const ACCELERATION = 0.8;
const FRICTION = 0.85;
const AIR_FRICTION = 0.95;
const COYOTE_TIME = 100; // milliseconds
const JUMP_BUFFER_TIME = 100; // milliseconds

// Animation Constants - Updated for individual frames
const ANIMATION_DEFS = {
    idle: { frames: 1, speed: 0.1 },    // Using base sprite as idle
    walk: { frames: 8, speed: 0.15 },   // 8 walk frames
    run:  { frames: 6, speed: 0.25 },   // 6 run frames  
    jump: { frames: 1, speed: 1 }       // Using base sprite as jump
};

// --- p5.js Lifecycle Functions ---
function preload() {
            console.log('Starting preload...');
        try {
            // Create a procedural tileset instead of loading external image
            createProceduralTileset();
            
            // Load base player sprite (for idle and jump) - using first walk frame as idle
            playerSprite = loadImage('Animation/Walk Cycle/Right foot forward, left arm forward, slight forward lean.png',
                () => console.log('Base player sprite loaded successfully'),
                () => console.error('Failed to load base player sprite')
            );
        
        // Load walk cycle frames
        const walkFrameNames = [
            'Animation/Walk Cycle/Right foot forward, left arm forward, slight forward lean.png',
            'Animation/Walk Cycle/ Right foot plants, body upright, hair bounces up 1 pixel.png',
            'Animation/Walk Cycle/Weight transfers, left foot begins lifting.png',
            'Animation/Walk Cycle/Left foot passing, arms at sides, tunic sways back.png',
            'Animation/Walk Cycle/Left foot forward, right arm forw.png',
            'Animation/Walk Cycle/Left foot plants, hair settles, pig emblems visible.png',
            'Animation/Walk Cycle/Weight transfers right.png',
            'Animation/Walk Cycle/Return to frame 1 position.png'
        ];
        
        // Load run cycle frames
        const runFrameNames = [
            'Animation/Run Cycle/ Full sprint pose, right leg extended back, left arm pumping.png',
            'Animation/Run Cycle/Both feet briefly off ground, body leaning forward 15°.png',
            'Animation/Run Cycle/Left foot impacts, dust particles spawn.png',
            'Animation/Run Cycle/Powerful push-off left leg, hair streaming back.png',
            'Animation/Run Cycle/Airborne again, arms pumping opposite.png',
            'Animation/Run Cycle/Right foot ready to land, completing cycle.png'
        ];
        
        // Load walk frames
        for (let i = 0; i < walkFrameNames.length; i++) {
            animationFrames.walk[i] = loadImage(walkFrameNames[i],
                () => console.log(`Walk frame ${i} loaded`),
                () => console.error(`Failed to load walk frame ${i}`)
            );
        }
        
        // Load run frames
        for (let i = 0; i < runFrameNames.length; i++) {
            animationFrames.run[i] = loadImage(runFrameNames[i],
                () => console.log(`Run frame ${i} loaded`),
                () => console.error(`Failed to load run frame ${i}`)
            );
        }
        
        console.log('Animation frames loading initiated');
        
    } catch (error) {
        console.error('Error in preload:', error);
    }

    // NOTE: The sound files below are placeholders.
    // To enable audio, create an 'assets/sounds' directory and place the following files in it:
    // - jump.wav, collect.wav, stomp.wav, powerup.wav, win.wav
    // - music.mp3 (or any other background music file)
    // soundFormats('wav', 'mp3');
    // bgMusic = loadSound('assets/sounds/music.mp3');
    // jumpSound = loadSound('assets/sounds/jump.wav');
    // collectSound = loadSound('assets/sounds/collect.wav');
    // stompSound = loadSound('assets/sounds/stomp.wav');
    // powerupSound = loadSound('assets/sounds/powerup.wav');
    // winSound = loadSound('assets/sounds/win.wav');
}

function createProceduralTileset() {
    // Create a 128x128 tileset with 16x16 tiles
    tileset = createImage(128, 128);
    tileset.loadPixels();
    
    // Ground tile (0,0)
    drawTileAt(tileset, 0, 0, [139, 69, 19], [160, 82, 45]); // Brown ground
    
    // Water tile (0,32)
    drawTileAt(tileset, 0, 32, [64, 164, 223], [41, 128, 185]); // Blue water
    
    // Waterfall frames (32,32) and (64,32)
    drawTileAt(tileset, 32, 32, [64, 164, 223], [41, 128, 185], true); // Waterfall frame 1
    drawTileAt(tileset, 64, 32, [41, 128, 185], [64, 164, 223], true); // Waterfall frame 2
    
    // Crystal (64,0)
    drawCrystalAt(tileset, 64, 0, [0, 220, 255]); // Cyan crystal
    
    // Sunstone (96,0)
    drawCrystalAt(tileset, 96, 0, [255, 223, 0]); // Yellow sunstone
    
    // Crumbling block (96,0) - using same position as sunstone, will fix
    drawTileAt(tileset, 96, 0, [160, 82, 45], [139, 69, 19], false, true); // Cracked ground
    
    // Enemy slug frames (0,64) and (32,64)
    drawSlugAt(tileset, 0, 64, [120, 100, 90]); // Frame 1
    drawSlugAt(tileset, 32, 64, [100, 80, 70]); // Frame 2
    
    // Deep water (32,64) - overlaps with slug, will use different position
    drawTileAt(tileset, 64, 64, [20, 40, 100], [10, 20, 50]); // Dark blue
    
    tileset.updatePixels();
    console.log('Procedural tileset created');
}

function drawTileAt(img, x, y, color1, color2, vertical = false, cracked = false) {
    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
            const idx = ((y + j) * img.width + (x + i)) * 4;
            const useColor2 = vertical ? (i % 4 < 2) : (j % 4 < 2);
            const color = useColor2 ? color2 : color1;
            
            if (cracked && i === j) {
                // Draw crack
                img.pixels[idx] = 0;
                img.pixels[idx + 1] = 0;
                img.pixels[idx + 2] = 0;
            } else {
                img.pixels[idx] = color[0];
                img.pixels[idx + 1] = color[1];
                img.pixels[idx + 2] = color[2];
            }
            img.pixels[idx + 3] = 255;
        }
    }
}

function drawCrystalAt(img, x, y, color) {
    // Draw a simple diamond shape
    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
            const idx = ((y + j) * img.width + (x + i)) * 4;
            const centerX = 8;
            const centerY = 8;
            const dist = abs(i - centerX) + abs(j - centerY);
            
            if (dist <= 6) {
                const brightness = map(dist, 0, 6, 1, 0.3);
                img.pixels[idx] = color[0] * brightness;
                img.pixels[idx + 1] = color[1] * brightness;
                img.pixels[idx + 2] = color[2] * brightness;
                img.pixels[idx + 3] = 255;
            } else {
                img.pixels[idx + 3] = 0; // Transparent
            }
        }
    }
}

function drawSlugAt(img, x, y, color) {
    // Draw a simple slug shape
    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
            const idx = ((y + j) * img.width + (x + i)) * 4;
            
            // Simple oval shape for slug
            if (j >= 4 && j <= 12 && i >= 2 && i <= 14) {
                const edgeDist = min(i - 2, 14 - i, j - 4, 12 - j);
                const brightness = map(edgeDist, 0, 4, 0.6, 1);
                img.pixels[idx] = color[0] * brightness;
                img.pixels[idx + 1] = color[1] * brightness;
                img.pixels[idx + 2] = color[2] * brightness;
                img.pixels[idx + 3] = 255;
            } else {
                img.pixels[idx + 3] = 0; // Transparent
            }
        }
    }
}

function setup() {
    console.log('Starting setup...');
    try {
        createCanvas(1920, 1080); // Full HD resolution
        console.log('Canvas created');
        
        // Set up idle and jump animations to use base sprite
        animationFrames.idle[0] = playerSprite;
        animationFrames.jump[0] = playerSprite;
        
        console.log('Setup completed successfully');
        
        initializeGame();
        console.log('Game initialized');
    } catch (error) {
        console.error('Error in setup:', error);
    }
}

function draw() {
    switch (gameState) {
        case 'mainMenu':
            drawMainMenu();
            break;
        case 'playing':
            drawGame();
            break;
        case 'gameOver':
            drawGameOver();
            break;
        case 'levelComplete':
            drawLevelClear();
            break;
    }
}

function mousePressed() {
    console.log('Mouse pressed! Current gameState:', gameState);
    switch (gameState) {
        case 'mainMenu':
            console.log('Transitioning from mainMenu to playing');
            gameState = 'playing';
            // Start background music on loop
            if (bgMusic && !bgMusic.isPlaying()) {
                bgMusic.loop();
            }
            break;
        case 'gameOver':
        case 'levelComplete':
            console.log('Restarting game');
            if (bgMusic) {
                bgMusic.stop();
            }
            initializeGame();
            gameState = 'playing';
            break;
    }
}

function drawGame() {
    background(135, 206, 250); // Light blue sky

    // --- Frame calculations ---
    // Use p5.js's built-in deltaTime (time since last frame in milliseconds)
    // Convert to seconds and cap the value to prevent physics glitches on lag
    let dt = min(deltaTime / 1000, 0.05);

    // Update game logic
    updatePlayer(dt);
    updateEnemies(dt);
    updatePowerUps();
    updateCrystals();
    updateAnimation();
    updateCamera();
    updateAndDrawParticles();
    
    // Update visual effects and tutorial system
    visualEffects.update(dt * 1000); // Convert back to milliseconds for visual effects
    tutorialSystem.update(player, dt * 1000);
    
    // Update waterfall animation
    waterfallAnimFrame = (waterfallAnimFrame + 0.1) % TILE_DEFS.WATERFALL.length;

    // Draw everything with visual effects
    push();
    
    // Apply screen shake from visual effects
    visualEffects.draw();
    
    translate(-camera.x, -camera.y);

    drawLevel();
    drawCrystals();
    drawEnemies();
    drawPowerUps();
    drawPlayer();

    pop();

    // Draw UI and tutorials (in screen space)
    drawUI();
    tutorialSystem.draw();
}

function drawUI() {
    // Draw Score
    fill(255);
    textSize(28);
    textAlign(LEFT, TOP);
    text(`Crystals: ${score} / ${crystals.length}`, 20, 20);
    
    // Draw Health Bar
    const barWidth = 200;
    const barHeight = 20;
    const barX = 20;
    const barY = 60;
    
    // Background
    fill(50);
    rect(barX, barY, barWidth, barHeight);
    
    // Health
    fill(255, 50, 50);
    rect(barX, barY, barWidth * (player.health / player.maxHealth), barHeight);
    
    // Border
    noFill();
    stroke(255);
    strokeWeight(2);
    rect(barX, barY, barWidth, barHeight);
    
    // Health text
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    text(`HP: ${player.health}/${player.maxHealth}`, barX + barWidth/2, barY + barHeight/2);
    
    // Stamina Bar
    const stamBarY = barY + 30;
    fill(50);
    rect(barX, stamBarY, barWidth, barHeight/2);
    
    fill(50, 200, 50);
    rect(barX, stamBarY, barWidth * (player.stamina / player.maxStamina), barHeight/2);
    
    noFill();
    stroke(255);
    strokeWeight(1);
    rect(barX, stamBarY, barWidth, barHeight/2);
    
    textAlign(LEFT, TOP);
}

function drawMainMenu() {
    background(20, 30, 50);
    fill(255);
    textSize(64);
    textAlign(CENTER, CENTER);
    text('Jenny\'s Journey', width / 2, height / 2 - 50);
    textSize(32);
    text('Click to Start', width / 2, height / 2 + 50);
}

function drawGameOver() {
    background(100, 20, 20, 150);
    fill(255);
    textSize(64);
    textAlign(CENTER, CENTER);
    text('Game Over', width / 2, height / 2 - 50);
    textSize(32);
    text('Click to Try Again', width / 2, height / 2 + 50);
}

function drawLevelClear() {
    background(20, 30, 50, 150); // Dark, semi-transparent background
    fill(255);
    textSize(64);
    textAlign(CENTER, CENTER);
    text('Level Clear!', width / 2, height / 2 - 50);
    textSize(32);
    text('Click to Play Again', width / 2, height / 2 + 50);
}

// --- Game Initialization ---
function initializeGame() {
    console.log('Starting game initialization...');
    // Initialize game systems
    visualEffects = new VisualEffects();
    console.log('VisualEffects initialized');
    tutorialSystem = new TutorialSystem();
    console.log('TutorialSystem initialized');

    // Initialize game state
    score = 0;
    levelComplete = false;
    isInSecretZone = false;
    
    // Create level, player, camera
    level = generateLevel(LEVEL_WIDTH_TILES, LEVEL_HEIGHT_TILES);
    
    // Find a valid starting position for the player
    let startX = 0;
    let startY = 0;
    for (let x = 5; x < LEVEL_WIDTH_TILES; x++) {
        if (getTile(x, LEVEL_HEIGHT_TILES - 5) === 0 && getTile(x, LEVEL_HEIGHT_TILES - 4) === 1) {
            startX = x * TILE_SIZE;
            startY = (LEVEL_HEIGHT_TILES - 5) * TILE_SIZE;
            break;
        }
    }
    
    // Create player object
    player = {
        x: startX,
        y: startY,
        vx: 0,
        vy: 0,
        width: TILE_SIZE,
        height: TILE_SIZE,
        onGround: false,
        sunstoneActive: false,
        sunstoneTimer: 0,
        // Animation properties
        state: 'idle',
        direction: 1, // 1 for right, -1 for left
        currentFrame: 0,
        frameTimer: 0,
        // Enhanced movement properties
        lastGroundedTime: 0,
        jumpBufferTime: 0,
        isJumping: false,
        jumpHeldTime: 0,
        maxJumpTime: 200, // milliseconds
        isDying: false,
        deathTimer: 0,
        // Combat properties
        health: 10,
        maxHealth: 10,
        stamina: 100,
        maxStamina: 100,
        attackCooldown: 0,
        dodgeCooldown: 0,
        blockHeld: false,
        invulnerable: false,
        invulnerabilityTime: 0,
        isAttacking: false,
        isDodging: false
    };
    
    camera = {
        x: 0,
        y: 0
    };
    
    // Reset game objects
    crystals = [];
    enemies = [];
    powerUps = [];
    crumblingBlocks = [];
    particles = [];
    playerTrail = [];
    
    // Populate level with objects
    for (let y = 0; y < LEVEL_HEIGHT_TILES; y++) {
        for (let x = 0; x < LEVEL_WIDTH_TILES; x++) {
            const tile = getTile(x, y);
            const worldX = x * TILE_SIZE;
            const worldY = y * TILE_SIZE;
            
            if (tile === 4) { // Crystal
                crystals.push({ x: worldX, y: worldY, collected: false });
                level.tiles[y][x] = 0; // Remove crystal tile from map
            } else if (tile === 6) { // Enemy
                enemies.push(new Enemy(worldX, worldY, 'slug'));
                level.tiles[y][x] = 0; // Remove enemy tile from map
            } else if (tile === 5) { // Sunstone power-up
                 powerUps.push({ x: worldX, y: worldY, type: 'sunstone', collected: false });
                 level.tiles[y][x] = 0;
            } else if (tile === 3) { // Crumbling block
                crumblingBlocks.push(new CrumblingBlock(worldX, worldY));
            }
        }
    }

    // Set initial checkpoint
    checkpoint = { x: player.x, y: player.y };
    waterfallAnimFrame = 0;
    
    // Reset and start music if available
    if (bgMusic && bgMusic.isLoaded()) {
        if (bgMusic.isPlaying()) {
            bgMusic.stop();
        }
        bgMusic.loop();
    }
    
    // Ensure all animation frames are ready
    if (!animationFrames.walk[0] || !animationFrames.run[0]) {
        console.error("Animation frames not ready for game start!");
        // Maybe handle this more gracefully, e.g., show a 'loading...' message
        return;
    }
    
    console.log("Game initialized successfully");
}

// --- Level Generation ---
function generateLevel(width, height) {
    const level = {
        tiles: []
    };
    
    // Initialize level with empty tiles
    for (let y = 0; y < height; y++) {
        level.tiles[y] = [];
        for (let x = 0; x < width; x++) {
            level.tiles[y][x] = 0; // Empty space
        }
    }
    
    // Generate ground
    const groundLevel = height - 3;
    for (let x = 0; x < width; x++) {
        for (let y = groundLevel; y < height; y++) {
            level.tiles[y][x] = 1; // Ground tile
        }
    }
    
    // Add some platforms
    for (let i = 0; i < 10; i++) {
        const platformX = Math.floor(Math.random() * (width - 5)) + 2;
        const platformY = Math.floor(Math.random() * (groundLevel - 5)) + 5;
        const platformWidth = Math.floor(Math.random() * 4) + 2;
        
        for (let x = platformX; x < platformX + platformWidth && x < width; x++) {
            level.tiles[platformY][x] = 1; // Ground tile
        }
    }
    
    // Add some crystals
    for (let i = 0; i < 5; i++) {
        const crystalX = Math.floor(Math.random() * width);
        const crystalY = Math.floor(Math.random() * (groundLevel - 2)) + 2;
        
        if (level.tiles[crystalY][crystalX] === 0) {
            level.tiles[crystalY][crystalX] = 4; // Crystal
        }
    }
    
    // Add some enemies
    for (let i = 0; i < 3; i++) {
        const enemyX = Math.floor(Math.random() * width);
        const enemyY = groundLevel - 1;
        
        if (level.tiles[enemyY][enemyX] === 0) {
            level.tiles[enemyY][enemyX] = 6; // Enemy
        }
    }
    
    return level;
}

// --- Game Classes ---
class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.vx = Math.random() > 0.5 ? 1 : -1;
        this.vy = 0;
        this.width = TILE_SIZE;
        this.height = TILE_SIZE;
        this.isAlive = true;
        this.onGround = false;
    }
    
    update(level, deltaTime) {
        if (!this.isAlive) return;
        
        // Simple AI: move back and forth
        this.x += this.vx;
        
        // Check for walls or edges
        const tileX = Math.floor(this.x / TILE_SIZE);
        const tileY = Math.floor(this.y / TILE_SIZE);
        
        // Turn around if hitting a wall or edge
        if (getTile(tileX + (this.vx > 0 ? 1 : 0), tileY) === 1 || 
            getTile(tileX, tileY + 1) === 0) {
            this.vx *= -1;
        }
        
        // Apply gravity
        this.vy += GRAVITY;
        this.y += this.vy;
        
        // Ground collision
        const groundTileY = Math.floor((this.y + this.height) / TILE_SIZE);
        if (getTile(tileX, groundTileY) === 1) {
            this.y = groundTileY * TILE_SIZE - this.height;
            this.vy = 0;
            this.onGround = true;
        } else {
            this.onGround = false;
        }
    }
    
    takeDamage(amount) {
        this.isAlive = false;
        createBurst(this.x + this.width / 2, this.y + this.height / 2, [255, 100, 100]);
    }
}

class CrumblingBlock {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.crumbling = false;
        this.timer = 0;
        this.gone = false;
    }
    
    update() {
        if (this.crumbling && !this.gone) {
            this.timer--;
            if (this.timer <= 0) {
                this.gone = true;
            }
        }
    }
    
    startCrumbling() {
        if (!this.crumbling) {
            this.crumbling = true;
            this.timer = 60; // 1 second at 60fps
        }
    }
}

// --- Player Logic (Phase 1) ---
function updatePlayer(deltaTime) {
    if (levelComplete) return;
    
    // Handle death animation
    if (player.isDying) {
        player.deathTimer--;
        player.vy += GRAVITY * 0.5;
        player.y += player.vy;
        
        if (player.deathTimer <= 0) {
            // Respawn at checkpoint
            player.x = checkpoint.x;
            player.y = checkpoint.y;
            player.vx = 0;
            player.vy = 0;
            player.isDying = false;
            player.isJumping = false;
            player.onGround = false;
        }
        return;
    }

    // --- Power-up Timers ---
    if (player.sunstoneActive && millis() > player.sunstoneTimer) {
        player.sunstoneActive = false;
                    console.log('Sunstone power-up expired.');
    }

    let currentSpeed = MOVE_SPEED;
    let currentAcceleration = ACCELERATION;

    // Task 2.4.1: Check for water physics
    const playerFeetTileX = floor((player.x + player.width / 2) / TILE_SIZE);
    const playerFeetTileY = floor((player.y + player.height) / TILE_SIZE);
    if (getTile(playerFeetTileX, playerFeetTileY) === 2) { // Is player in water?
        currentSpeed *= WATER_SPEED_MODIFIER;
        currentAcceleration *= WATER_SPEED_MODIFIER;
    }

    // Task 4.3.2: Check for deep water hazard - with death animation
    if (getTile(playerFeetTileX, playerFeetTileY) === 6) {
        if (!player.isDying) {
            player.isDying = true;
            player.deathTimer = 30; // Half second death animation
            player.vy = -8; // Small hop
            console.log('Fell into deep water!');
        }
        return;
    }

    // Task 4.4.3: Check for level exit
    const playerCenterTileX = floor((player.x + player.width / 2) / TILE_SIZE);
    const playerCenterTileY = floor((player.y + player.height / 2) / TILE_SIZE);
    if (getTile(playerCenterTileX, playerCenterTileY) === 7) {
        levelComplete = true;
        if (winSound) winSound.play();
        console.log('Level Clear!');
        return;
    }

    // Task 3.2.2: Check for secret zone
    if (getTile(playerCenterTileX, playerCenterTileY) === 4) {
        isInSecretZone = true;
    } else {
        isInSecretZone = false;
    }

    // Update combat cooldowns
    if (player.attackCooldown > 0) player.attackCooldown -= deltaTime || 16;
    if (player.dodgeCooldown > 0) player.dodgeCooldown -= deltaTime || 16;
    if (player.invulnerabilityTime > 0) player.invulnerabilityTime -= deltaTime || 16;

    // Combat controls
    if ((keyIsDown(90) || keyIsDown(32)) && player.attackCooldown <= 0) { // Z key or SPACE
        player.isAttacking = true;
        player.attackCooldown = 500; // 0.5 second cooldown
        performPlayerAttack();
    }
    
    if (keyIsDown(88) && player.dodgeCooldown <= 0 && player.onGround) { // X key
        player.isDodging = true;
        player.dodgeCooldown = 1000; // 1 second cooldown
        player.invulnerabilityTime = 300; // 0.3 seconds of invulnerability
        player.vx = player.direction * MOVE_SPEED * 2; // Quick dash
    }
    
    if (keyIsDown(SHIFT)) { // SHIFT for blocking
        player.blockHeld = true;
        currentSpeed *= 0.5; // Slow movement while blocking
    } else {
        player.blockHeld = false;
    }

    // Enhanced horizontal movement with acceleration
    let targetVx = 0;
    if (!player.isDodging) { // Can't control movement during dodge
        if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // A key
            targetVx = -currentSpeed;
            player.direction = -1;
        } else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // D key
            targetVx = currentSpeed;
            player.direction = 1;
        }
    }

    // Apply acceleration/deceleration
    if (targetVx !== 0) {
        player.vx = lerp(player.vx, targetVx, currentAcceleration);
    } else {
        // Apply friction
        player.vx *= player.onGround ? FRICTION : AIR_FRICTION;
        if (abs(player.vx) < 0.1) player.vx = 0;
    }
    
    // Check for vine climbing
    checkVineClimbing();

    // Track grounded state for coyote time
    if (player.onGround) {
        player.lastGroundedTime = millis();
    }

    // Check if jump button was pressed (for jump buffering)
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
        player.jumpBufferTime = millis();
    }

    // Enhanced jump mechanics
    const canJump = (player.onGround || millis() - player.lastGroundedTime < COYOTE_TIME);
    const jumpBuffered = (millis() - player.jumpBufferTime < JUMP_BUFFER_TIME);
    
    if (jumpBuffered && canJump && !player.isJumping) {
        player.vy = JUMP_FORCE;
        player.onGround = false;
        player.isJumping = true;
        player.jumpHeldTime = 0;
        player.jumpBufferTime = 0; // Clear buffer
        if (jumpSound) jumpSound.play();
    }

    // Variable jump height - holding jump makes you jump higher
    if (player.isJumping && (keyIsDown(UP_ARROW) || keyIsDown(87))) {
        if (player.jumpHeldTime < player.maxJumpTime) {
            player.vy -= 0.3; // Add a little upward force
            player.jumpHeldTime += deltaTime;
        }
    } else if (player.isJumping && player.vy < 0) {
        // If jump is released early, reduce upward velocity
        player.vy *= 0.7;
        player.isJumping = false;
    }

    // Reset jump when landing
    if (player.onGround && player.vy >= 0) {
        player.isJumping = false;
        player.jumpHeldTime = 0;
    }

    // Task 1.1.4: Apply Gravity
    player.vy += GRAVITY;
    
    // Terminal velocity
    if (player.vy > 20) player.vy = 20;

    // Task 1.1.5, 1.2.4, 1.2.5: Collision and Response
    player.onGround = false;

    // Determine player's animation state - UPDATED for better walk/run distinction
    if (!player.onGround) {
        player.state = 'jump';
    } else if (abs(player.vx) > 3.5) {  // Running at higher speeds
        player.state = 'run';
    } else if (abs(player.vx) > 0.5) {  // Walking at lower speeds
        player.state = 'walk';
    } else {
        player.state = 'idle';
    }

    // Apply horizontal movement and check for collision
    player.x += player.vx;
    
    // Prevent going out of bounds
    player.x = constrain(player.x, 0, LEVEL_WIDTH_TILES * TILE_SIZE - player.width);
    
    handleCollision('x');

    // Apply vertical movement and check for collision
    player.y += player.vy;
    
    // Prevent going below the level
    if (player.y > LEVEL_HEIGHT_TILES * TILE_SIZE) {
        // Fell off the bottom - respawn
        if (!player.isDying) {
            player.isDying = true;
            player.deathTimer = 30;
            console.log('Fell off the level!');
        }
        return;
    }
    
    handleCollision('y');

    // Task 2.3.3: Player-enemy collision
    for (const enemy of enemies) {
        if (enemy.isAlive) {
            const stompBox = {
                x: player.x,
                y: player.y + player.height - 10,
                width: player.width,
                height: 10
            };
            const enemyHitbox = {
                x: enemy.x,
                y: enemy.y,
                width: enemy.width,
                height: enemy.height
            };

            // Stomp check
            if (player.vy > 0 && rectsOverlap(stompBox, enemyHitbox)) {
                enemy.isAlive = false;
                player.vy = JUMP_FORCE * 0.6; // Small bounce
                createBurst(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, [120, 100, 90]);
                if (stompSound) stompSound.play();
            }
            // Side collision check
            else if (rectsOverlap(player, enemy)) {
                // Task 3.3.4: If sunstone is active, defeat enemy on touch
                if (player.sunstoneActive) {
                    enemy.isAlive = false;
                    createBurst(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, [120, 100, 90]);
                    if (stompSound) stompSound.play();
                } else {
                    console.log('Player hit enemy from the side. Resetting.');
                    gameState = 'gameOver';
                    break; // Exit loop after reset
                }
            }
        }
    }
}

function rectsOverlap(r1, r2) {
    return r1.x < r2.x + r2.width &&
           r1.x + r1.width > r2.x &&
           r1.y < r2.y + r2.height &&
           r1.y + r1.height > r2.y;
}

function handleCollision(axis) {
    const isYAxis = axis === 'y';
    const isXAxis = axis === 'x';

    const start = isYAxis ? floor(player.y / TILE_SIZE) : floor(player.x / TILE_SIZE);
    const end = isYAxis ? floor((player.y + player.height) / TILE_SIZE) : floor((player.x + player.width) / TILE_SIZE);

    for (let i = start; i <= end; i++) {
        const fixedCoord = i * TILE_SIZE;
        
        let leadingEdge, otherEdgeStart, otherEdgeEnd;
        if (isYAxis) {
            leadingEdge = (player.vy >= 0) ? player.y + player.height : player.y;
            otherEdgeStart = floor(player.x / TILE_SIZE);
            otherEdgeEnd = floor((player.x + player.width - 1) / TILE_SIZE); // -1 to avoid edge case
        } else { // X-axis
            leadingEdge = (player.vx >= 0) ? player.x + player.width : player.x;
            otherEdgeStart = floor(player.y / TILE_SIZE);
            otherEdgeEnd = floor((player.y + player.height - 1) / TILE_SIZE); // -1 to avoid edge case
        }
        
        for (let j = otherEdgeStart; j <= otherEdgeEnd; j++) {
            const tileX = isXAxis ? i : j;
            const tileY = isYAxis ? i : j;
            const tile = getTile(tileX, tileY);

            // Check if it's a solid tile
            const solidTiles = (typeof TILES !== 'undefined') ? [
                TILES.GRASS, TILES.STONE_PLATFORM, TILES.WOOD_PLATFORM,
                TILES.WOOD_BRIDGE, TILES.ARENA_FLOOR, TILES.ROOT_PILLAR,
                TILES.TREE_TRUNK, TILES.CRUMBLING_BRANCH,
                1, 3, 5 // Legacy tiles
            ] : [1, 2, 3, 5, 9, 10, 11, 12]; // Default solid tiles
            if (solidTiles.includes(tile)) { // Solid tiles
                const tilePos = isYAxis ? tileY * TILE_SIZE : tileX * TILE_SIZE;

                if (isYAxis) {
                    if (player.vy > 0) { // Moving down
                        player.y = tilePos - player.height - 0.01; // Small offset to prevent sticking
                        player.onGround = true;
                        player.vy = 0;
                    } else if (player.vy < 0) { // Moving up
                        player.y = tilePos + TILE_SIZE + 0.01;
                        player.vy = 0;
                    }
                } else { // X-axis
                    if (player.vx > 0) { // Moving right
                        player.x = tilePos - player.width - 0.01;
                        player.vx = 0;
                    } else if (player.vx < 0) { // Moving left
                        player.x = tilePos + TILE_SIZE + 0.01;
                        player.vx = 0;
                    }
                }

                 // Handle crumbling block collision
                if (tile === 5) {
                    for (const block of crumblingBlocks) {
                        if (block.x === tileX && block.y === tileY && !block.isCrumbling) {
                            block.isCrumbling = true;
                            block.timer = millis() + 500; // Crumble after 0.5 seconds
                        }
                    }
                }
                
                // Since we've found and resolved a collision on this axis, we don't need to check further.
                return; 
            }
        }
    }
}

function drawPlayer() {
    // Don't draw trail during death animation
    if (!player.isDying) {
        // Draw motion trail when moving fast
        if (abs(player.vx) > 2 || abs(player.vy) > 2) {
            playerTrail.push({
                x: player.x + player.width / 2,
                y: player.y + player.height / 2,
                alpha: 100
            });
        }
    }
    
    // Update and draw trail
    for (let i = playerTrail.length - 1; i >= 0; i--) {
        const trail = playerTrail[i];
        trail.alpha -= 5;
        
        if (trail.alpha <= 0) {
            playerTrail.splice(i, 1);
        } else {
            push();
            fill(255, 255, 255, trail.alpha);
            noStroke();
            const size = map(trail.alpha, 0, 100, 2, player.width * 0.6);
            ellipse(trail.x, trail.y, size, size);
            pop();
        }
    }
    
    // Task 3.3.4: Draw visual aura around the player when power-up is active
    if (player.sunstoneActive) {
        push();
        const auraSize = sin(frameCount * 0.2) * 10 + player.width + 20;
        const auraAlpha = sin(frameCount * 0.25) * 50 + 100;
        fill(255, 223, 0, auraAlpha); // Golden yellow aura
        noStroke();
        ellipse(player.x + player.width / 2, player.y + player.height / 2, auraSize, auraSize + 10);
        pop();
    }

    // Task 1.3.1 & 1.3.2: Draw the animated, oriented player sprite
    push();
    translate(player.x + player.width / 2, player.y + player.height / 2);
    
    // Death animation rotation
    if (player.isDying) {
        rotate(map(player.deathTimer, 30, 0, 0, PI * 2));
    }
    
    // Add squash and stretch based on velocity
    let scaleX = player.direction;
    let scaleY = 1;
    
    if (player.isJumping || !player.onGround) {
        // Stretch when jumping up, squash when falling
        scaleY = map(player.vy, -JUMP_FORCE, 10, 1.2, 0.8);
        scaleX *= map(abs(player.vy), 0, 10, 1, 0.9);
    } else if (abs(player.vx) > 3) {
        // Slight squash when running fast
        scaleY = 0.95;
        scaleX *= 1.05;
    }
    
    scale(scaleX, scaleY);

    // Get the current animation frame
    const currentAnim = animationFrames[player.state];
    const currentFrame = currentAnim[player.currentFrame];

    // Draw the current frame if it exists
    if (currentFrame && currentFrame.width > 0) {
        imageMode(CENTER);
        image(currentFrame, 0, 0, player.width, player.height);
        imageMode(CORNER);
    } else {
        // Fallback: Draw a simple character if frame not loaded
        fill(255);
        noStroke();
        rectMode(CENTER);
        rect(0, 0, player.width * 0.8, player.height * 0.9, 5);
        
        // Draw eyes
        fill(0);
        ellipse(-5, -5, 4, 4);
        ellipse(5, -5, 4, 4);
        
        // Draw a smile when moving
        if (abs(player.vx) > 1) {
            noFill();
            stroke(0);
            strokeWeight(2);
            arc(0, 0, 10, 10, 0, PI);
        }
        rectMode(CORNER);
    }
    
    pop();
}

// --- Level & World Logic (Phase 1) ---

// Task 1.2.3: getTile helper function
function getTile(tileX, tileY) {
    if (tileX < 0 || tileX >= LEVEL_WIDTH_TILES || tileY < 0 || tileY >= LEVEL_HEIGHT_TILES) {
        return 0; // Out of bounds is empty space
    }
    // Handle both 1D and 2D level arrays
    if (level.tiles) {
        return level.tiles[tileY][tileX];
    } else {
        return level[tileY * LEVEL_WIDTH_TILES + tileX];
    }
}

// Task 1.2.2: drawLevel function
function drawLevel() {
    const startCol = floor(camera.x / TILE_SIZE);
    const endCol = ceil((camera.x + width) / TILE_SIZE);
    const startRow = floor(camera.y / TILE_SIZE);
    const endRow = ceil((camera.y + height) / TILE_SIZE);

    for (let y = startRow; y < endRow; y++) {
        for (let x = startCol; x < endCol; x++) {
            const tileType = getTile(x, y);
            if (tileType === 0) continue; // Skip empty tiles

            const tx = x * TILE_SIZE;
            const ty = y * TILE_SIZE;
            
            // Use procedural drawing for new tile types
            push();
            noStroke();
            
            // Use TILES constants if available
            const T = (typeof TILES !== 'undefined') ? TILES : {
                GRASS: 1, STONE_PLATFORM: 2, WOOD_PLATFORM: 3,
                VINE_LADDER: 4, CRUMBLING_BRANCH: 5, SHALLOW_WATER: 6,
                WATER: 7, WATER_DEEP: 8, WOOD_BRIDGE: 9,
                ARENA_FLOOR: 10, ROOT_PILLAR: 11, TREE_TRUNK: 12,
                LEAVES: 13
            };
            
            switch (tileType) {
                case T.GRASS: // Grass ground
                    fill(100, 200, 100);
                    rect(tx, ty, TILE_SIZE, TILE_SIZE);
                    // Add grass texture
                    fill(80, 180, 80);
                    for (let i = 0; i < 5; i++) {
                        rect(tx + random(TILE_SIZE), ty + TILE_SIZE - 5, 2, 5);
                    }
                    break;
                    
                case T.STONE_PLATFORM: // Stone platform
                    fill(150, 150, 150);
                    rect(tx, ty, TILE_SIZE, TILE_SIZE);
                    fill(120, 120, 120);
                    rect(tx + 2, ty + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                    break;
                    
                case T.WOOD_PLATFORM: // Wood platform
                    fill(139, 69, 19);
                    rect(tx, ty, TILE_SIZE, TILE_SIZE);
                    stroke(100, 50, 0);
                    line(tx, ty + TILE_SIZE/2, tx + TILE_SIZE, ty + TILE_SIZE/2);
                    noStroke();
                    break;
                    
                case T.VINE_LADDER: // Vine ladder
                    // Draw vines
                    stroke(50, 150, 50);
                    strokeWeight(3);
                    line(tx + TILE_SIZE * 0.3, ty, tx + TILE_SIZE * 0.3, ty + TILE_SIZE);
                    line(tx + TILE_SIZE * 0.7, ty, tx + TILE_SIZE * 0.7, ty + TILE_SIZE);
                    // Leaves
                    noStroke();
                    fill(80, 200, 80);
                    ellipse(tx + TILE_SIZE * 0.3, ty + 10, 8, 8);
                    ellipse(tx + TILE_SIZE * 0.7, ty + 20, 8, 8);
                    break;
                    
                case T.CRUMBLING_BRANCH: // Collapsing branch
                    fill(100, 50, 20);
                    rect(tx, ty, TILE_SIZE, TILE_SIZE);
                    // Cracks
                    stroke(50, 25, 10);
                    line(tx + 5, ty + 5, tx + 15, ty + 15);
                    line(tx + 20, ty + 10, tx + 25, ty + 20);
                    noStroke();
                    break;
                    
                case T.SHALLOW_WATER: // Shallow water
                    fill(100, 150, 200, 150);
                    rect(tx, ty, TILE_SIZE, TILE_SIZE);
                    break;
                    
                case T.WATER: // Water
                    fill(64, 164, 223);
                    rect(tx, ty, TILE_SIZE, TILE_SIZE);
                    break;
                    
                case T.WATER_DEEP: // Deep water
                    fill(20, 40, 100);
                    rect(tx, ty, TILE_SIZE, TILE_SIZE);
                    break;
                    
                case T.WOOD_BRIDGE: // Wood bridge
                    fill(160, 82, 45);
                    rect(tx, ty, TILE_SIZE, TILE_SIZE);
                    stroke(139, 69, 19);
                    line(tx, ty, tx, ty + TILE_SIZE);
                    line(tx + TILE_SIZE/2, ty, tx + TILE_SIZE/2, ty + TILE_SIZE);
                    line(tx + TILE_SIZE, ty, tx + TILE_SIZE, ty + TILE_SIZE);
                    noStroke();
                    break;
                    
                case T.ARENA_FLOOR: // Arena floor
                    fill(180, 140, 100);
                    rect(tx, ty, TILE_SIZE, TILE_SIZE);
                    // Stone pattern
                    stroke(160, 120, 80);
                    rect(tx + 2, ty + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                    noStroke();
                    break;
                    
                case T.ROOT_PILLAR: // Root pillar
                    fill(80, 40, 20);
                    rect(tx, ty, TILE_SIZE, TILE_SIZE);
                    // Root texture
                    stroke(60, 30, 15);
                    for (let i = 0; i < 3; i++) {
                        line(tx + i * 10 + 5, ty, tx + i * 10 + 5, ty + TILE_SIZE);
                    }
                    noStroke();
                    break;
                    
                case T.TREE_TRUNK: // Tree trunk
                    fill(101, 67, 33);
                    rect(tx, ty, TILE_SIZE, TILE_SIZE);
                    break;
                    
                case T.LEAVES: // Leaves
                    fill(34, 139, 34, 200);
                    ellipse(tx + TILE_SIZE/2, ty + TILE_SIZE/2, TILE_SIZE * 1.2, TILE_SIZE * 1.2);
                    break;
                    
                default:
                    // Fallback to old tile system
                    if (tileType === 1) {
                        fill(139, 69, 19);
                        rect(tx, ty, TILE_SIZE, TILE_SIZE);
                    }
                    break;
            }
            
            pop();
        }
    }
}

// --- Camera Logic (Phase 1) ---
function updateCamera() {
    // Task 1.3.3: Follow player, centering them
    let targetX = player.x - width / 2 + player.width / 2;
    let targetY = player.y - height / 2 + player.height / 2;

    // Task 1.3.4: Constrain camera to level boundaries
    camera.x = constrain(targetX, 0, LEVEL_WIDTH_TILES * TILE_SIZE - width);
    camera.y = constrain(targetY, 0, LEVEL_HEIGHT_TILES * TILE_SIZE - height);
}

// --- Crystal Logic (Phase 2) ---

// Task 2.2.2: Draw crystals
function drawCrystals() {
    const tileDef = TILE_DEFS.CRYSTAL;
    for (const crystal of crystals) {
        if (!crystal.collected) {
            image(
                tileset,
                crystal.x,
                crystal.y,
                TILE_SIZE,
                TILE_SIZE,
                tileDef.x,
                tileDef.y,
                16,
                16
            );
        }
    }
}

// Task 2.2.3: Crystal collection
function updateCrystals() {
    for (const crystal of crystals) {
        if (!crystal.collected) {
            const d = dist(player.x + player.width / 2, player.y + player.height / 2, crystal.x + TILE_SIZE / 2, crystal.y + TILE_SIZE / 2);
            if (d < player.width + 10) {
                crystal.collected = true;
                score++;
                createBurst(crystal.x + TILE_SIZE / 2, crystal.y + TILE_SIZE / 2, [0, 220, 255]);
                if (collectSound) collectSound.play();
            }
        }
    }
}

// --- Enemy Logic (Phase 2) ---
function drawEnemies() {
    for (const enemy of enemies) {
        enemy.draw();
    }
}

function updateEnemies(deltaTime) {
    const scale = 60; // Match player's scale for consistent speed
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update(level, deltaTime * scale);
        
        // Handle enemy-tile collisions
        if (enemy.isAlive) {
            // Simple ground collision
            const enemyFeetY = enemy.y + enemy.height;
            const tileY = floor(enemyFeetY / TILE_SIZE);
            const tileX = floor((enemy.x + enemy.width/2) / TILE_SIZE);
            
            const waterTiles = (typeof TILES !== 'undefined') 
                ? [TILES.WATER, TILES.SHALLOW_WATER, TILES.WATER_DEEP] 
                : [7, 6, 8];
            if (getTile(tileX, tileY) !== 0 && !waterTiles.includes(getTile(tileX, tileY))) {
                enemy.y = (tileY * TILE_SIZE) - enemy.height;
                enemy.vy = 0;
            }
        }
    }
    
    // Check for boss spawn conditions
    const clearedSaplings = crystals.filter(c => c.type === 'sapling' && c.collected).length;
    if (clearedSaplings === 3 && !enemies.find(e => e.type === 'mutatedSproutling')) {
        // Spawn boss
        enemies.push(spawnBoss());
    }

    // Task 4.2.3: Update crumbling blocks
    for (let i = crumblingBlocks.length - 1; i >= 0; i--) {
        const block = crumblingBlocks[i];
        block.update();
        if (block.gone) {
            const tileX = Math.floor(block.x / TILE_SIZE);
            const tileY = Math.floor(block.y / TILE_SIZE);
            // Remove the block from the level
            if (level.tiles) {
                level.tiles[tileY][tileX] = 0;
            } else {
                level[tileY * LEVEL_WIDTH_TILES + tileX] = 0;
            }
            crumblingBlocks.splice(i, 1); // Remove from active list
        }
    }
}

// --- Power-up Logic (Phase 3) ---
function drawPowerUps() {
    const tileDef = TILE_DEFS.SUNSTONE;
    for (const powerUp of powerUps) {
        if (!powerUp.collected && powerUp.type === 'sunstone') {
             image(
                tileset,
                powerUp.x,
                powerUp.y,
                TILE_SIZE,
                TILE_SIZE,
                tileDef.x,
                tileDef.y,
                16,
                16
            );
        }
    }
}

function updatePowerUps() {
    for (const powerUp of powerUps) {
        if (!powerUp.collected) {
            const d = dist(player.x + player.width / 2, player.y + player.height / 2, powerUp.x + TILE_SIZE / 2, powerUp.y + TILE_SIZE / 2);
            if (d < player.width) {
                powerUp.collected = true;
                if (powerUp.type === 'sunstone') {
                    player.sunstoneActive = true;
                    player.sunstoneTimer = millis() + 10000; // 10 seconds duration
                    console.log('Sunstone power-up collected!');
                    createBurst(powerUp.x + TILE_SIZE / 2, powerUp.y + TILE_SIZE / 2, [255, 223, 0]);
                    if (powerupSound) powerupSound.play();
                }
            }
        }
    }
}

// --- Particle Logic (Phase 5) ---
function createBurst(x, y, color) {
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x,
            y: y,
            vx: random(-3, 3),
            vy: random(-5, 2),
            alpha: 255,
            color: color
        });
    }
}

function updateAndDrawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // Gravity on particles
        p.alpha -= 10;

        if (p.alpha <= 0) {
            particles.splice(i, 1);
        } else {
            noStroke();
            fill(p.color[0], p.color[1], p.color[2], p.alpha);
            
            if (p.isText) {
                textAlign(CENTER, CENTER);
                textSize(16);
                text(p.text, p.x, p.y);
            } else {
                ellipse(p.x, p.y, 5, 5);
            }
        }
    }
}

// --- Animation Logic (Updated for individual frames) ---
function updateAnimation() {
    const animDef = ANIMATION_DEFS[player.state];
    const currentAnim = animationFrames[player.state];
    
    // Only animate if we have frames for this state
    if (currentAnim && currentAnim.length > 0) {
        player.frameTimer += animDef.speed;

        if (player.frameTimer >= 1) {
            player.currentFrame++;
            if (player.currentFrame >= animDef.frames || player.currentFrame >= currentAnim.length) {
                player.currentFrame = 0;
            }
            player.frameTimer = 0;
        }
    } else {
        player.currentFrame = 0;
    }
}

// Combat Functions
function performPlayerAttack() {
    // Create attack hitbox in front of player
    const attackHitbox = {
        x: player.x + (player.direction > 0 ? player.width : -TILE_SIZE),
        y: player.y + player.height / 3,
        width: TILE_SIZE,
        height: player.height / 2
    };
    
    // Check hit on enemies
    for (const enemy of enemies) {
        if (enemy.isAlive && rectsOverlap(attackHitbox, enemy)) {
            enemy.takeDamage(1);
            // Knockback
            enemy.vx = player.direction * 5;
        }
    }
    
    // Visual effect
    createHitSpark(
        attackHitbox.x + attackHitbox.width / 2,
        attackHitbox.y + attackHitbox.height / 2
    );
}

// Player damage handling
function playerTakeDamage(amount) {
    if (player.invulnerabilityTime > 0) return;
    
    if (player.blockHeld) {
        // Block reduces damage and regenerates stamina
        amount = Math.floor(amount / 2);
        player.stamina = Math.min(player.maxStamina, player.stamina + 10);
        createHitSpark(player.x + player.width / 2, player.y + player.height / 2);
    }
    
    player.health -= amount;
    player.invulnerabilityTime = 1000; // 1 second of invulnerability
    createDamageNumbers(player.x + player.width / 2, player.y, amount);
    
    if (player.health <= 0) {
        gameState = 'gameOver';
    }
}

// The takeDamage function will be assigned to player in initializeGame

// Climbing mechanics for vines
function checkVineClimbing() {
    const playerTileX = floor((player.x + player.width / 2) / TILE_SIZE);
    const playerTileY = floor((player.y + player.height / 2) / TILE_SIZE);
    
    const vineLadderTile = (typeof TILES !== 'undefined' && TILES.VINE_LADDER) ? TILES.VINE_LADDER : 4;
    if (getTile(playerTileX, playerTileY) === vineLadderTile) {
        // Allow climbing
        if (keyIsDown(UP_ARROW) || keyIsDown(87)) { // W or UP
            player.vy = -3;
            player.onGround = true; // Prevent falling
            player.state = 'climbing';
        } else if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) { // S or DOWN
            player.vy = 3;
            player.state = 'climbing';
        } else {
            player.vy = 0; // Stay in place on vine
        }
    }
}

// Missing helper functions
function spawnBoss() {
    return new Enemy(LEVEL_WIDTH_TILES * TILE_SIZE / 2, (LEVEL_HEIGHT_TILES - 5) * TILE_SIZE, 'mutatedSproutling');
}

function createHitSpark(x, y) {
    createBurst(x, y, [255, 255, 255]);
}

function createDamageNumbers(x, y, damage) {
    // Simple damage number effect
    particles.push({
        x: x,
        y: y,
        vx: random(-1, 1),
        vy: -2,
        alpha: 255,
        color: [255, 0, 0],
        text: damage.toString(),
        isText: true
    });
}
