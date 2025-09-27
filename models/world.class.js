class World extends WorldTwo {
    /** @type {Character} - The player's character instance. */
    character = new Character();

    /** @type {Level} - The current level object containing enemies, items, and background. */
    level = level1;

    /** @type {HTMLCanvasElement} - The HTML canvas element for rendering. */
    canvas;

    /** @type {CanvasRenderingContext2D} - The 2D drawing context of the canvas. */
    ctx;

    /** @type {Keyboard} - The keyboard input handler. */
    keybord;

    /** @type {number} - The horizontal offset for the camera view. */
    camera_x = 0;

    /** @type {StatusBar} - The status bar for the character's health. */
    stadusBar = new StatusBar();

    /** @type {ThrowableObject[]} - An array of bottles currently being thrown. */
    throwableObject = [];

    /** @type {Audio} - Sound effect for collecting a coin. */
    coin_sound = new Audio('audio/coin_sound.mp3');

    /** @type {CoinBar} - The status bar for collected coins. */
    coinBar = new CoinBar();

    /** @type {Bottle[]} - An array of collectible bottle objects in the level. */
    bottle = [];

    /** @type {BottleBar} - The status bar for collected bottles. */
    bottleBar = new BottleBar();

    /** @type {number} - The current value of collected coins. */
    coinValue = 0;

    /** @type {number} - The current value of collected bottles. */
    bottleValue = 0;

    /** @type {Audio} - Sound effect for collecting a bottle. */
    bottle_sound = new Audio('audio/bottle_sound.mp3');

    /** @type {BossBar} - The status bar for the end boss's health. */
    bossBar = new BossBar();

    /** @type {number} - The current health of the end boss. */
    bossLife = 100;

    /** @type {Audio} - Sound effect for a bottle breaking. */
    breakBotte_sound = new Audio('audio/breakBottle.mp3');

    /** @type {Audio} - The background music for the level. */
    mexico_sound = new Audio('audio/mexico_sound.mp3');

    /** @type {Audio} - Sound effect for jumping on a chicken. */
    squeak_sound = new Audio('audio/squeak.mp3');

    /** @type {Audio} - Sound effect for the final boss. */
    finalBoss_sound = new Audio('audio/finalBoss_sound.mp3');

    /** @type {boolean} - A flag to enable or disable sounds. */
    sound = true;

    /**
     * Creates an instance of the World.
     * @param {HTMLCanvasElement} canvas - The canvas element to draw on.
     * @param {Keyboard} keybord - The keyboard input handler.
     */
    constructor(canvas, keybord) {
        super();
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keybord = keybord;
        this.draw();
        this.setWorld();
        this.run();
    }

    /**
     * Assigns this world instance to the character object to create a back-reference.
     */
    setWorld() {
        this.character.world = this;
    }

    /**
     * Runs the main game loops to continuously check for collisions, throwable objects, and character's life status.
     * If the boss's life reaches zero, it triggers the transition to the next level after a delay.
     */
    run() {
        const self = this;
        setInterval(() => {
            self.checkCollisions();
            self.checkThrowObject();
            self.isCharacterDead();
            if (self.bossLife <= 0) {
                setTimeout(() => {
                    self.nextLevel();
                }, 2000);
            }
        }, 50);
        setInterval(() => {
            this.jumpofChicken();
        }, 1000 / 25);
    }

    /**
     * Checks if the player can throw a bottle based on game conditions.
     * @returns {boolean} True if the player can throw a bottle, otherwise false.
     */
    iCanThrow() {
        return this.keybord.D && this.bottleValue > 0 && !this.isThrowingBottle;
    }

    /**
     * Checks if a bottle collides with the end boss.
     * @param {ThrowableObject} bottle - The bottle to check collision with.
     * @returns {boolean} True if a collision between the bottle and end boss is detected, otherwise false.
     */
    checkForCollidingBottleOfBoss(bottle) {
        return this.level.enemies.some(endboss => endboss instanceof Endboss && bottle.isColliding(endboss));
    }

    /**
     * Updates the life of the end boss when hit.
     * @returns {number} The updated life of the end boss.
     */
    bossLifeToUpdate() {
        this.bossLife -= 20;
        this.bossBar.setPercentage(this.bossLife);
        return this.bossLife;
    }

    /**
     * Handles the character receiving a hit from an enemy.
     */
    characterReceivesHit() {
        this.character.hit();
        this.updatesCharacterLife();
    }

    /**
     * Handles the logic for the character jumping on chickens.
     */
    jumpofChicken() {
        let characterHasJumped = false;
        const chickenGroups = [this.level.enemies, this.level.smallChicken];
        chickenGroups.forEach((chickenGroup) => {
            this.checkChickenGroupForJump(chickenGroup, characterHasJumped);
        });
    }

    /**
     * Checks each chicken in a group for a jumping interaction with the character.
     * @param {MovableObject[]} chickenGroup - The group of chickens to check.
     * @param {boolean} characterHasJumped - A flag indicating if the character has already jumped on a chicken in this frame.
     */
    checkChickenGroupForJump(chickenGroup, characterHasJumped) {
        chickenGroup.forEach((chicken) => {
            if (!characterHasJumped && this.checkCharachrterForCollidingChicken(chicken)) {
                if (this.character.isAboveGround(chicken)) {
                    this.jumpOnChicken(chicken, chickenGroup);
                    characterHasJumped = true;
                } else {
                    this.characterReceivesHit();
                }
            }
        });
    }

    /**
     * Handles the character successfully jumping on a chicken.
     * @param {MovableObject} chicken - The chicken object the character jumps on.
     * @param {MovableObject[]} chickenGroup - The array from which the chicken will be removed.
     */
    jumpOnChicken(chicken, chickenGroup) {
        this.jumpOnTheChicken(chicken);
        if (this.sound === true) {
            this.squeak_sound.play();
        }
        setTimeout(() => {
            const pos = chickenGroup.indexOf(chicken);
            chickenGroup.splice(pos, 1);
        }, 500);
    }

    /**
     * Checks for various collisions between game elements.
     */
    checkCollisions() {
        // Check if the character has reached the end boss
        if (this.character.x > 1600 && !this.level.endboss[0].hadFirstContact) {
            this.level.endboss[0].hadFirstContact = true;
        }

        if (this.isTheEndbossCollidingCharacter(this.character)) {
            this.characterReceivesHit();
            this.character.energy -= 20;
            this.characterCheckForEnergy();
        };
        this.thrownBottles();
        this.coinStatus();
        this.bottleValueStatus();
    }

    /**
     * Checks for collisions between the character and coins.
     * If a collision is detected, the coin is collected.
     */
    coinStatus() {
        this.level.coin.forEach((coin) => {
            if (this.isCharacterCollidingCoin(coin)) {
                this.characterIsCollidingCoin(coin);
                this.coinBar.setPercentage(this.coinValue);
            }
        });
    }

    /**
     * Checks for collisions between the character and collectible bottles.
     * If a collision is detected, the bottle is collected.
     */
    bottleValueStatus() {
        this.level.bottle.forEach((bottle) => {
            if (this.checkCharachrterForCollidingBottle(bottle)) {
                this.characterIsCollidingBottle(bottle);
                this.bottleBar.setPercentage(this.bottleValue);
            }
        });
    }

    /**
     * Checks the character's energy and handles the death state.
     */
    characterCheckForEnergy() {
        if (this.character.energy <= 0) {
            this.isCharacterDead();
            if (this.sound === true) {
                this.character.pains_sound.play();
            }
        }
        setTimeout(() => {
            this.sound = false;
        }, 1000);
    }

    /**
     * Manages the logic for thrown bottles, checking for collisions with enemies.
     */
    thrownBottles() {
        this.throwableObject.forEach((bottle) => {
            const hitEndboss = this.handleHitEndboss(bottle);
            if (hitEndboss) return;
            const hitChicken = this.handleHitChicken(bottle);
            if (hitChicken) return;
            this.handleHitEnemies(bottle);
        });
    }

    /**
     * Handles the collision of a thrown bottle with the end boss.
     * @param {ThrowableObject} bottle - The thrown bottle object.
     * @returns {Endboss | undefined} The end boss object if hit, otherwise undefined.
     */
    handleHitEndboss(bottle) {
        const hitEndboss = this.level.endboss.find(boss => !bottle.isBroken && boss instanceof Endboss && boss.isColliding(bottle));
        if (hitEndboss) {
            this.bossLife -= 20;
            if (this.bossLife <= 0) {
                this.bossLife = 0;
            }
            bottle.isBroken = true;
            this.bossBar.setPercentage(this.bossLife);
            if (this.sound === true) {
                this.breakBotte_sound.play();
            }
            setTimeout(() => {
                this.removeBottle();
            }, 300);
        }
        return hitEndboss;
    }

    /**
     * Handles the collision of a thrown bottle with a small chicken.
     * @param {ThrowableObject} bottle - The thrown bottle object.
     * @returns {SmallChicken | undefined} The hit chicken object if a collision occurs, otherwise undefined.
     */
    handleHitChicken(bottle) {
        const hitChicken = this.level.smallChicken.find(chicken => bottle.isColliding(chicken));
        if (hitChicken) {
            hitChicken.energy = 0;
            bottle.isBroken = true;
            this.removeBottle();
            if (this.sound === true) {
                this.breakBotte_sound.play();
            }
            setTimeout(() => {
                this.level.smallChicken.splice(this.level.smallChicken.indexOf(hitChicken), 1);
            }, 800);
        }
        return hitChicken;
    }

    /**
     * Handles the collision of a thrown bottle with regular chicken enemies.
     * @param {ThrowableObject} bottle - The thrown bottle object.
     */
    handleHitEnemies(bottle) {
        let chickenHit = false;
        this.level.enemies.forEach((enemy, enemyIndex) => {
            if (this.isChickenCollidingBottle(bottle, chickenHit, enemy)) {
                enemy.energy = 0;
                setTimeout(() => {
                    this.level.enemies.splice(enemyIndex, 1);
                }, 500);
                bottle.isBroken = true;
                this.removeBottle();
                chickenHit = true;
                if (this.sound === true) {
                    this.breakBotte_sound.play();
                }
            }
        });
    }

    /**
     * Updates the character's health on the status bar.
     */
    updatesCharacterLife() {
        this.stadusBar.setPercentage(this.character.energy);
    }

    /**
     * Checks if the end boss is colliding with the character.
     * @param {Character} character - The player's character.
     * @returns {boolean} True if any end boss is colliding with the character.
     */
    isTheEndbossCollidingCharacter(character) {
        return this.level.endboss.some(boss => boss.isColliding(character))
    }

    /**
     * Checks if a chicken is colliding with a bottle and has not been hit yet in the current check.
     * @param {ThrowableObject} bottle - The thrown bottle.
     * @param {boolean} chickenHit - A flag to ensure one bottle hits only one chicken.
     * @param {MovableObject} enemy - The enemy to check.
     * @returns {boolean} True if the enemy is a chicken and collides with the bottle.
     */
    isChickenCollidingBottle(bottle, chickenHit, enemy) {
        return !chickenHit && enemy instanceof Chicken && enemy.isColliding(bottle);
    }

    /**
     * Checks if the character is colliding with a coin.
     * @param {Coin} coin - The coin to check against.
     * @returns {boolean} True if they are colliding.
     */
    isCharacterCollidingCoin(coin) {
        return this.character.isColliding(coin)
    }

    /**
     * Handles the logic when a character collides with a coin.
     * @param {Coin} coin - The coin object the character collided with.
     */
    characterIsCollidingCoin(coin) {
        // Only increase the coin value if the bar is not already full
        if (this.coinValue < 100) {
            this.coinValue += 20;

            if (this.sound === true) {
                this.coin_sound.play();
            }

            // Find the position (index) of the collected coin in the array
            const coinIndex = this.level.coin.indexOf(coin);

            // If the coin was found...
            if (coinIndex > -1) {
                // ...remove it from the array so it cannot be collected again
                this.level.coin.splice(coinIndex, 1);
            }
        }
    }

    /**
     * Plays the jump sound, makes the character jump, and sets the enemy's energy to 0.
     * @param {MovableObject} enemy - The enemy that was jumped on.
     */
    jumpOnTheChicken(enemy) {
        if (this.sound === true) {
            this.character.jump_sound.play();
        }
        this.character.speedY = 30;
        enemy.energy = 0;
    }

    /**
     * Checks if the character is colliding with an enemy (like a chicken).
     * @param {MovableObject} enemy - The enemy to check against.
     * @returns {boolean} True if they are colliding.
     */
    checkCharachrterForCollidingChicken(enemy) {
        return this.character.isColliding(enemy);
    }

    /**
     * Checks if the character is colliding with a collectible bottle.
     * @param {Bottle} bottle - The bottle to check against.
     * @returns {boolean} True if they are colliding.
     */
    checkCharachrterForCollidingBottle(bottle) {
        return this.character.isColliding(bottle);
    }

    /**
     * Handles the logic when a character collides with a collectible bottle.
     * @param {Bottle} bottle - The bottle object the character collided with.
     */
    characterIsCollidingBottle(bottle) {
        if (this.bottleValue < 100) {
            this.bottleValue += 20;
            if (this.sound === true) {
                this.bottle_sound.play();
            }

            const bottleIndex = this.level.bottle.indexOf(bottle);
            if (bottleIndex > -1) {
                this.level.bottle.splice(bottleIndex, 1);
            }
        }
    }

    /**
     * Removes a bottle from the throwableObject array.
     * @param {number} index - The index of the bottle to remove.
     */
    removeBottle(index) {
        this.throwableObject.splice(index, 1);
    }

    /**
     * The main drawing function, called repeatedly by requestAnimationFrame.
     * It clears the canvas and draws all game objects.
     */
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.level.backgroundObjects);

        this.addObjectsToMap(this.level.clouds);
        this.addObjectsToMap(this.level.bottle);

        this.ctx.translate(-this.camera_x, 0);
        this.addToMap(this.stadusBar);
        this.addToMap(this.coinBar);
        this.addToMap(this.bottleBar);

        // Only display the boss's health bar if the fight has started
        if (this.level.endboss[0] && this.level.endboss[0].hadFirstContact) {
            this.addToMap(this.bossBar);
        }

        this.ctx.translate(this.camera_x, 0);

        this.addToMap(this.character);

        this.addObjectsToMap(this.level.coin);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.level.endboss);
        this.addObjectsToMap(this.level.smallChicken);
        this.addObjectsToMap(this.throwableObject);

        this.ctx.translate(-this.camera_x, 0);

        let self = this;
        requestAnimationFrame(function () {
            self.draw();
        });
    }

    /**
     * Iterates over an array of game objects and calls addToMap for each one.
     * @param {DrawableObject[]} objects - An array of objects to be drawn.
     */
    addObjectsToMap(objects) {
        objects.forEach(o => {
            this.addToMap(o);
        });
    }

    /**
     * Draws a single drawable object to the canvas, handling image flipping if necessary.
     * @param {DrawableObject} mo - The movable/drawable object to add to the map.
     */
    addToMap(mo) {
        if (mo.otherDiretion) {
            this.flipImage(mo);
        }
        mo.draw(this.ctx);
        if (mo.otherDiretion) {
            this.flipImageBack(mo);
        }
    }

    /**
     * Flips the canvas context horizontally to draw a mirrored image.
     * @param {DrawableObject} mo - The object being drawn.
     */
    flipImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.height, 0);
        this.ctx.scale(-1, 1);
        mo.x = mo.x * -1;
    }

    /**
     * Restores the canvas context after flipping the image.
     * @param {DrawableObject} mo - The object that was drawn.
     */
    flipImageBack(mo) {
        mo.x = mo.x * -1;
        this.ctx.restore();
    }
}