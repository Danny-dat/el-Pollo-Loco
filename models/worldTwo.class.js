class WorldTwo {
    /** @type {boolean} A flag to prevent the game over logic from running multiple times. */
    gameOverDisplayed = false;

    /**
     * Creates an instance of WorldTwo.
     */
    constructor() {
        this.play();
    }

    /**
     * Starts a loop to periodically check the game over state.
     */
    play() {
        setInterval(() => {
            this.gameOver();
        }, 1000);
    }

    /**
     * Checks if the character's energy has dropped to zero or below. 
     * If so, it triggers the game over sequence.
     */
    isCharacterDead() {
        if (!this.gameOverDisplayed && world.character.energy <= 0) {
            this.gameOverDisplayed = true;
            this.gameOver();
            world.character.sleep_sound.pause();
        }
    }

    /**
     * Displays or hides the game over screen based on the character's energy level.
     * If the character's energy is 0 or less, the game over screen is shown.
     * Otherwise, it ensures the game over screen is hidden.
     */
    gameOver() {
        let gameOverElement = document.getElementById('gameOver');
        if (world.character.energy <= 0) {
            gameOverElement.style.display = 'block';
        } else {
            gameOverElement.style.display = 'none';
            this.gameOverDisplayed = false;
        }
    }

    /**
     * Displays the "next level" screen.
     */
    nextLevel() {
        let nextLevel = document.getElementById('nextLevel');
        nextLevel.style.display = 'flex';
    }

    /**
     * Plays the coin collection sound effect if sound is enabled.
     */
    playCoinSound() {
        if (this.sound === true) {
            this.coin_sound.play();
        }
    }

    /**
     * Checks for collisions with coins and updates the player's coin count 
     * and the coin bar UI if a collision occurs.
     */
    coinStatus() {
        if (this.coinValue <= 100) {
            this.level.coin.forEach((coin) => {
                if (this.isCharacterCollidingCoin(coin)) {
                    this.characterIsCollidingCoin(coin)
                    if (this.coinValue === 100) {
                        this.coinValue = 100;
                    }
                    this.coinBar.setPercentage(this.coinValue);
                }
            });
        }
    }

    /**
     * Checks for collisions with collectible bottles on the ground and updates the player's 
     * bottle count and the corresponding UI bar.
     */
    bottleValueStatus() {
        if (this.bottleValue < 100) {
            this.level.bottle.forEach((bottle, index,) => {
                if (this.checkCharachrterForCollidingBottle(bottle)) {
                    this.characterIsCollidingBottle();
                    if (this.bottleValue > 100) {
                        this.bottleValue = 100;
                    }
                    this.bottleBar.setPercentage(this.bottleValue);
                    this.level.bottle.splice(index, 1);
                    this.bossBar.setPercentage(this.bossLife);
                }
            });
        }
    }

    /**
     * Handles the logic for throwing a bottle. It creates a new throwable object,
     * updates the player's bottle count, and sets the throwing state.
     * @returns {ThrowableObject} The newly created bottle object.
     */
    bottleStatus() {
        let bottle = new ThrowableObject(this.character.x + 100, this.character.y + 100);
        this.throwableObject.push(bottle);
        this.bottleValue -= 20;
        this.bottleBar.setPercentage(this.bottleValue);
        this.isThrowingBottle = true;
        return bottle;
    }

    /**
     * Removes a thrown bottle from the game world after a set delay.
     * @param {number} index - The index of the throwable object to remove from the array.
     */
    removeThrowableObject(index) {
        setTimeout(() => {
            this.throwableObject.splice(index, 1);
            this.isThrowingBottle = false;
            if (this.sound === true) {
                this.breakBotte_sound.play();
            }
        }, 1250);
    }

    /**
     * Checks if the player can and is attempting to throw a bottle.
     * If so, it initiates the throw and checks for immediate collisions.
     */
    checkThrowObject() {
        if (this.iCanThrow()) {
            let bottle = this.bottleStatus();
            if (this.checkForCollidingBottleOfBoss(bottle)) {
                this.bossLifeToUpdate(this.bossBar);
            }
            this.removeThrowableObject();
        }
    }
}