/**
 * Tutorial System
 * Manages tutorial popups, hints, and player guidance
 */

class TutorialSystem {
    constructor() {
        this.tutorials = LEVEL1_CONFIG.tutorials;
        this.triggeredTutorials = new Set();
        this.currentTutorial = null;
        this.tutorialTimer = 0;
        this.tutorialOpacity = 0;
        this.fadeSpeed = 5;
        
        // Tutorial state
        this.hasMovedLeft = false;
        this.hasMovedRight = false;
        this.hasJumped = false;
        this.hasClimbed = false;
        this.hasAttacked = false;
        this.hasDodged = false;
        this.hasBlocked = false;
    }
    
    update(player, deltaTime) {
        // Check for tutorial triggers
        for (const [key, tutorial] of Object.entries(this.tutorials)) {
            if (!this.triggeredTutorials.has(key)) {
                const trigger = tutorial.trigger;
                const distance = dist(player.x / TILE_SIZE, player.y / TILE_SIZE, trigger.x, trigger.y);
                
                if (distance < 3) { // Within 3 tiles
                    this.triggerTutorial(key, tutorial);
                }
            }
        }
        
        // Update current tutorial display
        if (this.currentTutorial) {
            this.tutorialTimer -= deltaTime;
            
            if (this.tutorialTimer > 3000) {
                // Fade in
                this.tutorialOpacity = min(255, this.tutorialOpacity + this.fadeSpeed);
            } else if (this.tutorialTimer > 0) {
                // Stay visible
                this.tutorialOpacity = 255;
            } else {
                // Fade out
                this.tutorialOpacity = max(0, this.tutorialOpacity - this.fadeSpeed);
                if (this.tutorialOpacity === 0) {
                    this.currentTutorial = null;
                }
            }
        }
        
        // Track player actions for dynamic hints
        this.trackPlayerProgress(player);
    }
    
    triggerTutorial(key, tutorial) {
        this.triggeredTutorials.add(key);
        this.currentTutorial = tutorial;
        this.tutorialTimer = 5000; // Show for 5 seconds
        this.tutorialOpacity = 0;
        
        // Play tutorial sound
        if (typeof tutorialSound !== 'undefined' && tutorialSound) tutorialSound.play();
    }
    
    trackPlayerProgress(player) {
        // Track movement
        if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) this.hasMovedLeft = true;
        if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) this.hasMovedRight = true;
        if (player.vy < -5) this.hasJumped = true;
        
        // Add more tracking as needed
    }
    
    draw() {
        if (!this.currentTutorial || this.tutorialOpacity === 0) return;
        
        push();
        
        // Tutorial background
        const padding = 20;
        const boxWidth = 400;
        const boxHeight = 100;
        const x = width / 2 - boxWidth / 2;
        const y = height - 200;
        
        // Background box
        fill(0, 0, 0, this.tutorialOpacity * 0.8);
        stroke(255, 255, 255, this.tutorialOpacity);
        strokeWeight(2);
        rectMode(CORNER);
        rect(x, y, boxWidth, boxHeight, 10);
        
        // Tutorial text
        fill(255, 255, 255, this.tutorialOpacity);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(20);
        text(this.currentTutorial.message, width / 2, y + boxHeight / 2);
        
        // Optional: Add key icons
        this.drawKeyHints(x, y, boxWidth, boxHeight);
        
        pop();
    }
    
    drawKeyHints(x, y, w, h) {
        // Draw visual key representations
        const keySize = 30;
        const keyY = y + h - 40;
        
        if (this.currentTutorial.message.includes("arrow keys")) {
            // Draw arrow keys
            this.drawKey(x + w/2 - 70, keyY, "←", keySize);
            this.drawKey(x + w/2 - 35, keyY, "↓", keySize);
            this.drawKey(x + w/2, keyY, "↑", keySize);
            this.drawKey(x + w/2 + 35, keyY, "→", keySize);
        }
        
        if (this.currentTutorial.message.includes("SPACE")) {
            this.drawKey(x + w/2 + 80, keyY, "SPACE", keySize * 2.5, keySize);
        }
        
        if (this.currentTutorial.message.includes("Z")) {
            this.drawKey(x + w/2 - 50, keyY, "Z", keySize);
        }
        
        if (this.currentTutorial.message.includes("X")) {
            this.drawKey(x + w/2, keyY, "X", keySize);
        }
        
        if (this.currentTutorial.message.includes("SHIFT")) {
            this.drawKey(x + w/2 + 50, keyY, "SHIFT", keySize * 2, keySize);
        }
    }
    
    drawKey(x, y, label, w, h) {
        if (!h) h = w; // Square by default
        
        push();
        
        // Key background
        fill(40, 40, 40, this.tutorialOpacity);
        stroke(100, 100, 100, this.tutorialOpacity);
        strokeWeight(2);
        rectMode(CENTER);
        rect(x, y, w, h, 5);
        
        // Key label
        fill(255, 255, 255, this.tutorialOpacity);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(14);
        text(label, x, y);
        
        pop();
    }
    
    // Helper methods for checking tutorial completion
    hasCompletedMovementTutorial() {
        return this.hasMovedLeft && this.hasMovedRight && this.hasJumped;
    }
    
    showHint(message, duration = 3000) {
        // Quick hint system for contextual tips
        this.currentTutorial = { message };
        this.tutorialTimer = duration;
        this.tutorialOpacity = 0;
    }
}

// Visual Effects System
class VisualEffects {
    constructor() {
        this.particles = [];
        this.screenShake = 0;
        this.screenShakeIntensity = 0;
        this.damageNumbers = [];
        this.bossTitle = null;
        this.bossTitleTimer = 0;
    }
    
    update(deltaTime) {
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update(deltaTime);
            
            if (p.isDead()) {
                this.particles.splice(i, 1);
            }
        }
        
        // Update damage numbers
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            const dn = this.damageNumbers[i];
            dn.y -= 2;
            dn.life -= deltaTime;
            
            if (dn.life <= 0) {
                this.damageNumbers.splice(i, 1);
            }
        }
        
        // Update screen shake
        if (this.screenShake > 0) {
            this.screenShake -= deltaTime;
        }
        
        // Update boss title
        if (this.bossTitleTimer > 0) {
            this.bossTitleTimer -= deltaTime;
        }
    }
    
    draw() {
        // Apply screen shake
        if (this.screenShake > 0) {
            const shakeX = random(-this.screenShakeIntensity, this.screenShakeIntensity);
            const shakeY = random(-this.screenShakeIntensity, this.screenShakeIntensity);
            translate(shakeX, shakeY);
        }
        
        // Draw particles
        this.particles.forEach(p => p.draw());
        
        // Draw damage numbers
        this.damageNumbers.forEach(dn => {
            push();
            fill(255, 255, 100);
            stroke(0);
            strokeWeight(2);
            textSize(24);
            textAlign(CENTER);
            const opacity = map(dn.life, 0, 1000, 0, 255);
            fill(255, 255, 100, opacity);
            text(dn.amount, dn.x, dn.y);
            pop();
        });
        
        // Draw boss title
        if (this.bossTitleTimer > 0) {
            push();
            resetMatrix();
            
            const titleOpacity = this.bossTitleTimer > 2000 ? 
                map(this.bossTitleTimer, 3000, 2000, 0, 255) :
                map(this.bossTitleTimer, 500, 0, 255, 0);
                
            // Title background
            fill(0, 0, 0, titleOpacity * 0.8);
            noStroke();
            rect(0, height/2 - 60, width, 120);
            
            // Title text
            fill(255, 50, 50, titleOpacity);
            textAlign(CENTER, CENTER);
            textSize(48);
            text(this.bossTitle, width/2, height/2);
            
            pop();
        }
    }
}

// Particle class
class Particle {
    constructor(x, y, vx, vy, color, size, lifetime) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.gravity = 0.3;
    }
    
    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.lifetime -= deltaTime;
    }
    
    draw() {
        push();
        const alpha = map(this.lifetime, 0, this.maxLifetime, 0, 255);
        fill(this.color[0], this.color[1], this.color[2], alpha);
        noStroke();
        ellipse(this.x, this.y, this.size);
        pop();
    }
    
    isDead() {
        return this.lifetime <= 0;
    }
}

// Helper functions for creating effects
function createBurst(x, y, color, count = 20) {
    for (let i = 0; i < count; i++) {
        const angle = random(TWO_PI);
        const speed = random(2, 8);
        const vx = cos(angle) * speed;
        const vy = sin(angle) * speed;
        const size = random(3, 8);
        const lifetime = random(500, 1000);
        
        visualEffects.particles.push(new Particle(x, y, vx, vy, color, size, lifetime));
    }
}

function createDustCloud(x, y) {
    const color = [180, 150, 120]; // Brown dust
    for (let i = 0; i < 10; i++) {
        const vx = random(-2, 2);
        const vy = random(-3, -1);
        const size = random(10, 20);
        visualEffects.particles.push(new Particle(x, y, vx, vy, color, size, 800));
    }
}

function createSporeCloud(x, y, radius) {
    const color = [150, 255, 150]; // Green spores
    const count = 30;
    for (let i = 0; i < count; i++) {
        const angle = (TWO_PI / count) * i;
        const distance = random(0, radius);
        const px = x + cos(angle) * distance;
        const py = y + sin(angle) * distance;
        const size = random(5, 15);
        visualEffects.particles.push(new Particle(px, py, 0, -0.5, color, size, 2000));
    }
}

function createDamageNumbers(x, y, amount) {
    visualEffects.damageNumbers.push({
        x: x + random(-10, 10),
        y: y,
        amount: amount,
        life: 1000
    });
}

function createScreenShake(duration, intensity = 10) {
    visualEffects.screenShake = duration;
    visualEffects.screenShakeIntensity = intensity;
}

function createBossTitle(title) {
    visualEffects.bossTitle = title;
    visualEffects.bossTitleTimer = 3000;
}

function createHitSpark(x, y) {
    const color = [255, 255, 100]; // Yellow spark
    createBurst(x, y, color, 10);
}

function createDeathBurst(x, y) {
    const color = [255, 100, 100]; // Red burst
    createBurst(x, y, color, 30);
}

function createMuzzleFlash(x, y) {
    const color = [255, 255, 200]; // Bright flash
    for (let i = 0; i < 5; i++) {
        const size = random(5, 10);
        visualEffects.particles.push(new Particle(x, y, 0, 0, color, size, 100));
    }
}

// Placeholder functions for complex effects
function createVineWhip(x1, y1, x2, y2) {
    // Create a line of particles from source to target
    const steps = 10;
    for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const px = lerp(x1, x2, t);
        const py = lerp(y1, y2, t);
        const color = [100, 200, 100];
        visualEffects.particles.push(new Particle(px, py, 0, 0, color, 8, 300));
    }
}

function createGroundSlam(x, y) {
    // Create expanding shockwave
    const color = [150, 100, 50];
    for (let angle = 0; angle < TWO_PI; angle += PI/8) {
        const vx = cos(angle) * 5;
        const vy = sin(angle) * 2;
        visualEffects.particles.push(new Particle(x, y, vx, vy, color, 15, 500));
    }
    createScreenShake(300, 15);
}

function dropLoot(x, y) {
    // Placeholder for loot drop
    const lootTypes = ['health_potion', 'stamina_herb', 'coin'];
    const lootType = random(lootTypes);
    
    // Create sparkle effect
    const color = [255, 200, 50];
    for (let i = 0; i < 10; i++) {
        const angle = random(TWO_PI);
        const speed = random(1, 3);
        const vx = cos(angle) * speed;
        const vy = sin(angle) * speed - 2;
        visualEffects.particles.push(new Particle(x, y, vx, vy, color, 3, 1000));
    }
}

function triggerLevelComplete() {
    // Set level complete flag
    levelComplete = true;
    createScreenShake(1000, 5);
    
    // Victory particles
    const color = [255, 200, 50];
    for (let i = 0; i < 50; i++) {
        const x = random(width);
        const y = random(height);
        const vx = random(-1, 1);
        const vy = random(-5, -2);
        visualEffects.particles.push(new Particle(x, y, vx, vy, color, random(3, 8), 3000));
    }
} 