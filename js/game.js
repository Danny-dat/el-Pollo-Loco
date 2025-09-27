/** @type {HTMLCanvasElement} The main game canvas element. */
let canvas;

/** @type {World} The main game world object. */
let world;

/** @type {Keyboard} An instance of the Keyboard class to handle user input. */
let keybord = new Keyboard();

/** @type {boolean} Flag to track the mute state of the game audio. Default is false (sound on). */
let isMuted = false;

/**
 * Initializes the game settings when the page is loaded.
 */
function init() {
    canvas = document.getElementById('canvas');
    // Load the mute setting from local storage.
    // The '===' check ensures we correctly parse the string 'true'.
    isMuted = localStorage.getItem('isGameMuted') === 'true';
    updateVolumeIcon();
    checkOrientation();
}

/**
 * Starts the game by hiding the start screen and initializing the level and world.
 */
function start() {
    let startPolloLoco = document.getElementById('startPolloLoco');
    startPolloLoco.style.display = 'none';
    closInfo();
    initLevel();
    mobilRun();

    world = new World(canvas, keybord);
    // Directly apply the loaded sound setting to the game world.
    world.sound = !isMuted;
}

/**
 * Toggles the game's audio mute state, saves the preference to local storage,
 * and updates the volume icon accordingly.
 */
function volume() {
    isMuted = !isMuted; // Flip the muted state
    localStorage.setItem('isGameMuted', isMuted); // Save the new state

    if (world) {
        world.sound = !isMuted; // Apply the change to the running game instance
    }
    updateVolumeIcon();
}

/**
 * Updates the volume icon's source image based on the 'isMuted' state.
 */
function updateVolumeIcon() {
    let volumeIcon = document.getElementById('volume');
    if (isMuted) {
        volumeIcon.src = 'img/stumm.png'; // Path to the muted icon
    } else {
        volumeIcon.src = 'img/lautsprecher.png'; // Path to the unmuted icon
    }
}

/**
 * Restarts the game by reloading the entire page.
 */
function reStart() {
    window.location.reload();
}

/**
 * Restarts the game without a full page reload by clearing intervals and calling start().
 */
function restartGame() {
    document.getElementById('nextLevel').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    clearAllIntervals();
    start();
}

/**
 * A brute-force method to clear all active intervals on the page.
 */
function clearAllIntervals() {
    for (let i = 1; i < 9999; i++) window.clearInterval(i);
}

/**
 * Hides the informational note element.
 */
function closInfo() {
    let infoNote = document.getElementById('infoNote');
    infoNote.style.display = 'none';
}

/**
 * Toggles the visibility of the informational note element.
 */
function infoNote() {
    let infoNote = document.getElementById('infoNote');
    if (infoNote.style.display === 'flex') {
        infoNote.style.display = 'none';
    } else {
        infoNote.style.display = 'flex';
    }
}

// Event listener for when the DOM is fully loaded.
window.addEventListener('DOMContentLoaded', init);

// Event listener to check screen orientation on resize.
window.addEventListener("resize", checkOrientation);

// Event listener for keydown events to handle player controls.
window.addEventListener("keydown", (e) => {
    if (e.keyCode == 39) keybord.RIGHT = true;
    if (e.keyCode == 37) keybord.LEFT = true;
    if (e.keyCode == 32) keybord.SPACE = true;
    if (e.keyCode == 68) keybord.D = true;
});

// Event listener for keyup events to handle player controls.
window.addEventListener("keyup", (e) => {
    if (e.keyCode == 39) keybord.RIGHT = false;
    if (e.keyCode == 37) keybord.LEFT = false;
    if (e.keyCode == 32) keybord.SPACE = false;
    if (e.keyCode == 68) keybord.D = false;
});

/**
 * Sets up touch event listeners for mobile controls.
 */
function mobilRun() {
    document.getElementById("left").addEventListener("touchstart", (e) => { e.preventDefault(); keybord.LEFT = true; });
    document.getElementById("left").addEventListener("touchend", (e) => { e.preventDefault(); keybord.LEFT = false; });
    document.getElementById("right").addEventListener("touchstart", (e) => { e.preventDefault(); keybord.RIGHT = true; });
    document.getElementById("right").addEventListener("touchend", (e) => { e.preventDefault(); keybord.RIGHT = false; });
    document.getElementById("jump").addEventListener("touchstart", (e) => { e.preventDefault(); keybord.SPACE = true; });
    document.getElementById("jump").addEventListener("touchend", (e) => { e.preventDefault(); keybord.SPACE = false; });
    document.getElementById("throw").addEventListener("touchstart", (e) => { e.preventDefault(); keybord.D = true; });
    document.getElementById("throw").addEventListener("touchend", (e) => { e.preventDefault(); keybord.D = false; });
}

/**
 * Checks the screen orientation and adjusts the UI for mobile or desktop views.
 * It shows a "rotate device" message in portrait mode and manages the visibility of mobile controls.
 */
function checkOrientation() {
    let startButton = document.getElementById('startButton');
    if (window.innerHeight > window.innerWidth) {
        document.getElementById('handy').style.display = 'block';
        document.getElementById('mobileKeysNone').style.display = 'none';
        startButton.style.display = 'none';
    } else {
        document.getElementById('handy').style.display = 'none';
        startButton.style.display = 'block';
        if (window.innerWidth >= 945) {
            document.getElementById('mobileKeysNone').style.display = 'none';
        } else {
            document.getElementById('mobileKeysNone').style.display = 'block';
        }
    }
}