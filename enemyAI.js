/**
 * Enemy AI System
 * Handles behavior patterns for all enemy types in Level 1
 */

class EnemyAI {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        
        // Load enemy config from level data
        const config = (typeof LEVEL1_CONFIG !== 'undefined' && LEVEL1_CONFIG.enemies && LEVEL1_CONFIG.enemies[type]) 
            ? LEVEL1_CONFIG.enemies[type] 
            : { health: 3, damage: 1, attacks: [], behavior: 'patrol', dropRate: 0.3 };
        this.sprite = config.sprite;
        this.maxHealth = config.health;
        this.health = config.health;
        this.damage = config.damage;
        this.attacks = config.attacks;
        this.behavior = config.behavior;
        this.dropRate = config.dropRate;
        
        // Common properties
        this.vx = 0;
        this.vy = 0;
        this.width = 32;
        this.height = 32;
        this.isAlive = true;
        this.state = 'idle';
        this.stateTimer = 0;
        this.direction = 1; // 1 = right, -1 = left
        this.animFrame = 0;
        this.animTimer = 0;
        
        // Type-specific properties
        this.initializeTypeSpecific();
    }
    
    rectsOverlap(r1, r2) {
        return r1.x < r2.x + r2.width &&
               r1.x + r1.width > r2.x &&
               r1.y < r2.y + r2.height &&
               r1.y + r1.height > r2.y;
    }
    
    initializeTypeSpecific() {
        switch(this.type) {
            case 'sproutling':
                this.width = 48;
                this.height = 48;
                this.attackCooldown = 2000; // 2 seconds between attacks
                this.lastAttackTime = 0;
                this.projectiles = [];
                this.detectionRange = 200;
                break;
                
            case 'foragingBoar':
                this.width = 64;
                this.height = 48;
                this.patrolSpeed = 1;
                this.chargeSpeed = 8;
                this.patrolRange = 150;
                this.chargeRange = 100;
                this.chargeCooldown = 3000;
                this.lastChargeTime = 0;
                this.isCharging = false;
                break;
                
            case 'mutatedSproutling':
                this.width = 96;
                this.height = 96;
                this.phase = 1;
                this.attackPattern = 0;
                this.bossIntroComplete = false;
                this.invulnerableTime = 0;
                break;
        }
    }
    
    update(player, deltaTime) {
        if (!this.isAlive) return;
        
        // Update invulnerability
        if (this.invulnerableTime > 0) {
            this.invulnerableTime -= deltaTime;
        }
        
        // Update animation
        this.animTimer += deltaTime;
        if (this.animTimer > 100) { // Change frame every 100ms
            this.animFrame = (this.animFrame + 1) % 2;
            this.animTimer = 0;
        }
        
        // Behavior-specific updates
        switch(this.behavior) {
            case 'stationary_ranged':
                this.updateSproutling(player, deltaTime);
                break;
            case 'patrol_charge':
                this.updateForagingBoar(player, deltaTime);
                break;
            case 'boss_pattern':
                this.updateMutatedSproutling(player, deltaTime);
                break;
        }
        
        // Apply physics
        const gravity = (typeof GRAVITY !== 'undefined') ? GRAVITY : 0.8;
        this.vy += gravity * 0.5; // Enemies have lighter gravity
        this.x += this.vx;
        this.y += this.vy;
        
        // Update projectiles if any
        if (this.projectiles) {
            this.updateProjectiles(player);
        }
    }
    
    updateSproutling(player, deltaTime) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Face the player
        this.direction = dx > 0 ? 1 : -1;
        
        if (distance < this.detectionRange) {
            this.state = 'alert';
            
            // Attack if cooldown is over
            if (Date.now() - this.lastAttackTime > this.attackCooldown) {
                this.performAttack(player);
                this.lastAttackTime = Date.now();
            }
        } else {
            this.state = 'idle';
        }
    }
    
    updateForagingBoar(player, deltaTime) {
        const dx = player.x - this.x;
        const distance = Math.abs(dx);
        
        if (this.isCharging) {
            // Continue charge
            this.vx = this.chargeSpeed * this.direction;
            this.state = 'charging';
            
            // Stop charge after hitting wall or traveling far enough
            if (Math.abs(this.x - this.chargeStartX) > 200) {
                this.isCharging = false;
                this.vx = 0;
                this.state = 'recover';
                this.stateTimer = 1000; // 1 second recovery
            }
        } else if (this.state === 'recover') {
            this.vx = 0;
            this.stateTimer -= deltaTime;
            if (this.stateTimer <= 0) {
                this.state = 'patrol';
            }
        } else if (distance < this.chargeRange && Date.now() - this.lastChargeTime > this.chargeCooldown) {
            // Start charge
            this.isCharging = true;
            this.chargeStartX = this.x;
            this.direction = dx > 0 ? 1 : -1;
            this.lastChargeTime = Date.now();
            this.state = 'preparing';
            
            // Telegraph the charge
            setTimeout(() => {
                if (this.isAlive && typeof createDustCloud !== 'undefined') {
                    createDustCloud(this.x, this.y + this.height);
                }
            }, 500);
        } else {
            // Patrol behavior
            this.state = 'patrol';
            if (Math.abs(this.x - this.startX) > this.patrolRange) {
                this.direction *= -1;
            }
            this.vx = this.patrolSpeed * this.direction;
        }
    }
    
    updateMutatedSproutling(player, deltaTime) {
        if (!this.bossIntroComplete) {
            // Boss intro animation
            this.state = 'intro';
            this.bossIntroComplete = true;
            if (typeof createBossTitle !== 'undefined') createBossTitle("Corrupted Sproutling");
            return;
        }
        
        // Phase transition at 50% health
        if (this.health <= this.maxHealth / 2 && this.phase === 1) {
            this.phase = 2;
            this.state = 'phase_transition';
            this.invulnerableTime = 2000;
            if (typeof createScreenShake !== 'undefined') createScreenShake(500);
            return;
        }
        
        // Attack patterns based on phase
        this.stateTimer -= deltaTime;
        if (this.stateTimer <= 0) {
            this.chooseNextAttack(player);
        }
    }
    
    performAttack(player) {
        const attack = this.attacks[Math.floor(Math.random() * this.attacks.length)];
        
        switch(attack) {
            case 'seed_shot':
                this.shootSeed(player);
                break;
            case 'vine_whip':
                this.vineWhip(player);
                break;
            case 'seed_barrage':
                this.seedBarrage(player);
                break;
            case 'spore_burst':
                this.sporeBurst();
                break;
            case 'vine_slam':
                this.vineSlam(player);
                break;
        }
    }
    
    shootSeed(target) {
        const angle = Math.atan2(target.y - this.y, target.x - this.x);
        this.projectiles.push({
            x: this.x + this.width/2,
            y: this.y + this.height/2,
            vx: Math.cos(angle) * 5,
            vy: Math.sin(angle) * 5,
            width: 8,
            height: 8,
            damage: this.damage
        });
        
        // Visual feedback
        if (typeof createMuzzleFlash !== 'undefined') {
            createMuzzleFlash(this.x + this.width/2, this.y + this.height/2);
        }
    }
    
    seedBarrage(target) {
        // Shoot multiple seeds in a spread pattern
        for (let i = -2; i <= 2; i++) {
            const baseAngle = Math.atan2(target.y - this.y, target.x - this.x);
            const angle = baseAngle + (i * 0.2); // Spread of 0.2 radians
            
            setTimeout(() => {
                if (this.isAlive) {
                    this.projectiles.push({
                        x: this.x + this.width/2,
                        y: this.y + this.height/2,
                        vx: Math.cos(angle) * 4,
                        vy: Math.sin(angle) * 4,
                        width: 8,
                        height: 8,
                        damage: this.damage
                    });
                }
            }, i * 100); // Stagger the shots
        }
        
        this.stateTimer = 2000; // 2 second cooldown
    }
    
    sporeBurst() {
        // Create AoE spore cloud
        if (typeof createSporeCloud !== 'undefined') {
            createSporeCloud(this.x + this.width/2, this.y + this.height/2, 150);
        }
        this.stateTimer = 3000; // 3 second cooldown
    }
    
    updateProjectiles(player) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            
            // Update position
            proj.x += proj.vx;
            proj.y += proj.vy;
            
            // Check collision with player
            if (this.rectsOverlap(proj, player) && !player.invulnerable) {
                player.takeDamage(proj.damage);
                this.projectiles.splice(i, 1);
                continue;
            }
            
            // Remove if off-screen
            const levelWidth = (typeof LEVEL_WIDTH_TILES !== 'undefined') ? LEVEL_WIDTH_TILES : 120;
            const levelHeight = (typeof LEVEL_HEIGHT_TILES !== 'undefined') ? LEVEL_HEIGHT_TILES : 30;
            const tileSize = (typeof TILE_SIZE !== 'undefined') ? TILE_SIZE : 32;
            
            if (proj.x < -100 || proj.x > levelWidth * tileSize + 100 ||
                proj.y < -100 || proj.y > levelHeight * tileSize + 100) {
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    takeDamage(amount) {
        if (this.invulnerableTime > 0) return;
        
        this.health -= amount;
        this.invulnerableTime = 300; // 0.3 seconds of invulnerability
        
        // Visual feedback
        if (typeof createDamageNumbers !== 'undefined') {
            createDamageNumbers(this.x + this.width/2, this.y, amount);
        }
        if (typeof createHitSpark !== 'undefined') {
            createHitSpark(this.x + this.width/2, this.y + this.height/2);
        }
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        this.isAlive = false;
        
        // Death particles
        if (typeof createDeathBurst !== 'undefined') {
            createDeathBurst(this.x + this.width/2, this.y + this.height/2);
        }
        
        // Drop loot
        if (Math.random() < this.dropRate && typeof dropLoot !== 'undefined') {
            dropLoot(this.x + this.width/2, this.y + this.height/2);
        }
        
        // Boss-specific death
        if (this.type === 'mutatedSproutling' && typeof triggerLevelComplete !== 'undefined') {
            triggerLevelComplete();
        }
    }
    
    draw() {
        if (!this.isAlive) return;
        
        push();
        translate(this.x + this.width/2, this.y + this.height/2);
        
        // Flip sprite based on direction
        scale(this.direction, 1);
        
        // Flash when hit
        if (this.invulnerableTime > 0 && Math.floor(this.invulnerableTime / 100) % 2) {
            tint(255, 150, 150);
        }
        
        // Draw sprite (placeholder rectangle for now)
        fill(this.type === 'sproutling' ? [100, 200, 100] : 
              this.type === 'foragingBoar' ? [150, 100, 50] : 
              [150, 250, 150]);
        rectMode(CENTER);
        rect(0, 0, this.width, this.height);
        
        // Draw health bar for bosses
        if (this.type === 'mutatedSproutling') {
            this.drawBossHealthBar();
        }
        
        pop();
        
        // Draw projectiles
        if (this.projectiles) {
            this.projectiles.forEach(proj => {
                fill(200, 255, 200);
                ellipse(proj.x, proj.y, proj.width, proj.height);
            });
        }
    }
    
    drawBossHealthBar() {
        push();
        resetMatrix(); // Draw in screen space
        
        const barWidth = 400;
        const barHeight = 20;
        const x = width/2 - barWidth/2;
        const y = 50;
        
        // Background
        fill(50);
        rect(x, y, barWidth, barHeight);
        
        // Health
        fill(255, 50, 50);
        rect(x, y, barWidth * (this.health / this.maxHealth), barHeight);
        
        // Border
        noFill();
        stroke(255);
        strokeWeight(2);
        rect(x, y, barWidth, barHeight);
        
        // Boss name
        fill(255);
        textAlign(CENTER);
        textSize(24);
        text("Corrupted Sproutling", width/2, y - 10);
        
        pop();
    }
    
    chooseNextAttack(player) {
        if (this.phase === 1) {
            // Phase 1: Basic attacks
            this.attackPattern = (this.attackPattern + 1) % 3;
            switch(this.attackPattern) {
                case 0:
                    this.shootSeed(player);
                    this.stateTimer = 1500;
                    break;
                case 1:
                    this.vineWhip(player);
                    this.stateTimer = 2000;
                    break;
                case 2:
                    this.state = 'moving';
                    this.stateTimer = 1000;
                    break;
            }
        } else {
            // Phase 2: Advanced attacks
            this.attackPattern = (this.attackPattern + 1) % 4;
            switch(this.attackPattern) {
                case 0:
                    this.seedBarrage(player);
                    break;
                case 1:
                    this.sporeBurst();
                    break;
                case 2:
                    this.vineSlam(player);
                    break;
                case 3:
                    this.state = 'enraged';
                    this.stateTimer = 3000;
                    break;
            }
        }
    }
    
    vineWhip(target) {
        // Placeholder for vine whip attack
        if (typeof createVineWhip !== 'undefined') {
            createVineWhip(this.x, this.y, target.x, target.y);
        }
        this.stateTimer = 1500;
    }
    
    vineSlam(target) {
        // Placeholder for vine slam attack
        if (typeof createGroundSlam !== 'undefined') {
            createGroundSlam(this.x + this.width/2, this.y + this.height);
        }
        this.stateTimer = 2500;
    }
}

// Helper function exports
function createEnemiesForLevel1() {
    const enemies = [];
    const tileSize = (typeof TILE_SIZE !== 'undefined') ? TILE_SIZE : 32;
    
    // Sproutlings in Tricklebrook
    enemies.push(new EnemyAI('sproutling', 65 * tileSize, 20 * tileSize));
    enemies.push(new EnemyAI('sproutling', 72 * tileSize, 22 * tileSize));
    
    // Foraging Boars in Tricklebrook
    enemies.push(new EnemyAI('foragingBoar', 70 * tileSize, 24 * tileSize));
    enemies.push(new EnemyAI('foragingBoar', 80 * tileSize, 24 * tileSize));
    
    return enemies;
}

// Boss spawning function
function spawnBoss() {
    const tileSize = (typeof TILE_SIZE !== 'undefined') ? TILE_SIZE : 32;
    return new EnemyAI('mutatedSproutling', 105 * tileSize, 20 * tileSize);
} 