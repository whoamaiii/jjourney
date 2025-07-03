# Forest Guardian - Game Design Document

## 📋 Project Overview
- **Current Status**: Planning Phase
- **Target Platform**: Web (p5.js)
- **Genre**: Metroidvania / Action-RPG
- **Art Style**: Pixel Art (32x32 base sprite)

---

## 🎭 1. Narrative & Identity

### Character Names (Choose One)
- [ ] **Bramble** - Evokes nature and thorny determination
- [ ] **Rowan** - A tree name meaning "little red one" (fitting the hair)
- [ ] **Fenwick** - Old English meaning "farm by the marsh"
- [ ] **Hazel** - Nature-inspired, suggests warmth and wisdom
- [ ] **Corvus** - Meaning "crow," hinting at forest connections

### Character Archetype
**The Reluctant Guardian**

### Backstory
- [ ] Finalize backstory details
- [ ] Create opening cutscene script
- [ ] Design mentor character appearance

> Once a simple apprentice to the village herbalist, this young guardian never expected to inherit the sacred duty of protecting the Whispering Woods. When their mentor vanished during the Night of Falling Stars, they discovered an ancient green tunic hidden in the workshop—adorned with the sigils of the Boar Clan, legendary protectors of the forest realm. The tunic chose them, binding their fate to the woodland spirits.

> Now they must navigate between two worlds: the human settlements that fear the darkening forest, and the magical creatures who grow increasingly hostile as a mysterious corruption spreads through their domain. Armed with their mentor's journal and the mystical tunic that grants communion with forest spirits, they seek to uncover the truth behind their mentor's disappearance and heal the growing rift between civilization and nature before both are consumed by shadow.

### Personality Implementation Checklist
- [ ] **Cautiously Optimistic**
  - [ ] Add dialogue options for peaceful solutions
  - [ ] Create "befriend" mechanic for certain enemies
  - [ ] Design positive idle animations
  
- [ ] **Resourceful**
  - [ ] Implement environmental interaction system
  - [ ] Create crafting UI
  - [ ] Add collectable materials system
  
- [ ] **Empathetic Listener**
  - [ ] Design dialogue system with multiple choices
  - [ ] Create hidden quest triggers based on conversations
  - [ ] Add reputation system for both factions
  
- [ ] **Stubbornly Loyal**
  - [ ] Implement companion rescue missions
  - [ ] Add consequences for abandoning NPCs in danger
  - [ ] Create loyalty rewards system

---

## 🎮 2. Gameplay Mechanics & Design

### Core Implementation Tasks

#### Primary Attack: Nature's Rhythm Combo
- [ ] Light Attack - Quick horizontal staff sweep
  - [ ] Create hitbox (width: 48px, height: 16px)
  - [ ] Add swoosh particle effect
  - [ ] Implement 0.2s attack duration
  
- [ ] Medium Attack - Upward vine-whip strike
  - [ ] Design vine sprite
  - [ ] Add launch effect for small enemies
  - [ ] Set knockback force value
  
- [ ] Heavy Finisher - Thorny root AOE
  - [ ] Create root emergence animation
  - [ ] Define AOE radius (64px)
  - [ ] Add ground crack visual effect

#### Defensive Move: Boar Spirit Guard
- [ ] Basic Block Implementation
  - [ ] Create translucent boar spirit overlay
  - [ ] Set damage reduction to 75%
  - [ ] Add stamina drain mechanic
  
- [ ] Perfect Parry System
  - [ ] Define parry window (0.2 seconds)
  - [ ] Add enemy stun duration (1.5 seconds)
  - [ ] Create parry spark effect
  
- [ ] Counter Attack
  - [ ] Design boar rush animation
  - [ ] Set counter damage multiplier
  - [ ] Add screen shake on impact

#### Mobility: Forest Stride
- [ ] Standard Jump
  - [ ] Set jump height (2.5 tiles)
  - [ ] Add ledge grab detection
  - [ ] Create vine/branch interaction
  
- [ ] Dodge Roll
  - [ ] Set invincibility frames (0.3 seconds)
  - [ ] Create spore cloud effect
  - [ ] Add roll distance (2 tiles)
  
- [ ] Unique Sprint
  - [ ] Remove foliage collision during sprint
  - [ ] Add leaf particle trail
  - [ ] Set sprint speed multiplier (1.5x)

### Progression System Implementation

#### Ability 1: Spore Burst
- [ ] **Base Ability**
  - [ ] Create charge animation
  - [ ] Design spore cloud sprite
  - [ ] Implement confusion AI state
  
- [ ] **Upgrades**
  - [ ] Level 1: Increase radius
  - [ ] Level 2: Add healing properties
  - [ ] Level 3: Spores spread between enemies

#### Ability 2: Root Bridge
- [ ] **Base Ability**
  - [ ] Create root growth animation
  - [ ] Set platform duration (10 seconds)
  - [ ] Add weight limit mechanic
  
- [ ] **Combat Application**
  - [ ] Enemy root entangle effect
  - [ ] Entangle duration (3 seconds)
  - [ ] Break-free mechanic for bosses

#### Ability 3: Feral Communion
- [ ] **Summon System**
  - [ ] Wolf - Damage dealer
    - [ ] Attack pattern AI
    - [ ] Loyalty duration
  - [ ] Deer - Speed boost
    - [ ] Movement buff percentage
    - [ ] Dash ability unlock
  - [ ] Owl - Secret revealer
    - [ ] Hidden path highlighting
    - [ ] Enemy weakness display
  
- [ ] **Ultimate Upgrade**
  - [ ] Implement mount system
  - [ ] Create mounted combat moves
  - [ ] Add mount-specific areas

---

## 🎨 3. Art & Animation Specifications

### Sprite Sheet Setup
- [ ] Create sprite sheet template (256x256)
- [ ] Set up animation grid system
- [ ] Define color palette (max 16 colors)

### Animation Checklist

#### Idle Animation (4 frames)
- [ ] Frame 1-2: Breathing animation (chest movement)
- [ ] Frame 3: Head turn animation
- [ ] Frame 4: Tunic adjustment detail
- [ ] Set loop timing (2 seconds)

#### Walk Cycle (8 frames)
- [ ] Frame 1: Right foot forward pose
- [ ] Frame 2: Right foot plant with hair bounce
- [ ] Frame 3: Weight transfer animation
- [ ] Frame 4: Left foot passing position
- [ ] Frame 5: Left foot forward pose
- [ ] Frame 6: Left foot plant (show pig emblems)
- [ ] Frame 7: Weight transfer right
- [ ] Frame 8: Loop connection frame

#### Run Cycle (6 frames)
- [ ] Frame 1: Full sprint extension
- [ ] Frame 2: Airborne lean (15° forward)
- [ ] Frame 3: Left foot impact with dust
- [ ] Frame 4: Powerful push-off
- [ ] Frame 5: Second airborne frame
- [ ] Frame 6: Right foot landing prep

#### Jump Animation Set
- [ ] **Take-off** (2 frames)
  - [ ] Crouch compression (3px down)
  - [ ] Explosive launch pose
  
- [ ] **Apex** (2 frames)
  - [ ] Arms spread wide
  - [ ] Tunic billowing effect
  
- [ ] **Landing** (2 frames)
  - [ ] Falling position
  - [ ] Impact absorption crouch

#### Combat Animations
- [ ] **3-Hit Combo**
  - [ ] Attack 1: Horizontal sweep (4 frames)
  - [ ] Attack 2: Overhead strike (4 frames)
  - [ ] Attack 3: Spin attack (6 frames)
  
- [ ] **Hurt Animation** (3 frames)
  - [ ] Impact recoil
  - [ ] Stagger step
  - [ ] Recovery stance
  
- [ ] **Death Sequence** (8 frames)
  - [ ] Frames 1-2: Fall to knees
  - [ ] Frames 3-4: Reach skyward
  - [ ] Frames 5-6: Collapse
  - [ ] Frames 7-8: Spirit particles

---

## 📁 Asset Requirements

### Sprites Needed
- [ ] Character sprite sheet (all animations)
- [ ] Boar spirit overlay (translucent)
- [ ] Vine whip sprites (3 growth stages)
- [ ] Root emergence sprites
- [ ] Spore cloud effects
- [ ] Particle effects sheet

### Environment Art
- [ ] Forest tileset (grass, trees, rocks)
- [ ] Village tileset (houses, paths, fences)
- [ ] Corruption effects (dark variants)
- [ ] Interactive objects (herbs, materials)

### UI Elements
- [ ] Health bar with nature theme
- [ ] Stamina bar (root design)
- [ ] Ability cooldown indicators
- [ ] Dialogue boxes (wood texture)
- [ ] Inventory grid system

---

## 🔧 Technical Implementation

### File Structure 