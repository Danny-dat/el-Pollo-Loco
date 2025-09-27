let canvas;
let world;
let keybord = new Keyboard();
let isMuted = false; // Standardwert: Ton ist AN

/**
 * Initializes the game settings when the page is loaded.
 */
function init() {
    canvas = document.getElementById('canvas');
    // Load the mute setting from storage.
    // The || 'false' ensures we have a string to parse.
    isMuted = localStorage.getItem('isGameMuted') === 'true';
    updateVolumeIcon();
    checkOrientation();
}

/**
 * Starts the game.
 */
function start() {
    let startPolloLoco = document.getElementById('startPolloLoco');
    startPolloLoco.style.display = 'none';
    closInfo();
    initLevel();
    mobilRun();

    world = new World(canvas, keybord);
    // Directly apply the sound setting to the game world.
    world.sound = !isMuted;
}

/**
 * Toggles the game volume, saves the setting, and updates the icon.
 */
function volume() {
    isMuted = !isMuted; // Flip the muted state
    localStorage.setItem('isGameMuted', isMuted); // Save the new state

    if (world) {
        world.sound = !isMuted; // Apply to the running game
    }
    updateVolumeIcon();
}

/**
 * Updates the volume icon based on the 'isMuted' state.
 */
function updateVolumeIcon() {
    let volumeIcon = document.getElementById('volume');
    if (isMuted) {
        volumeIcon.src = 'img/stumm.png';
    } else {
        volumeIcon.src = 'img/lautsprecher.png';
    }
}

/**
 * Restarts the game by reloading the page.
 */
function reStart() {
    window.location.reload();
}

/**
 * Restarts the game without reloading the page.
 */
function restartGame() {
    document.getElementById('nextLevel').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    clearAllIntervals();
    start();
}

function clearAllIntervals() {
    for (let i = 1; i < 9999; i++) window.clearInterval(i);
}

/**
 * Closes the info note displayed.
 */
function closInfo() {
    let infoNote = document.getElementById('infoNote');
    infoNote.style.display = 'none';
}

/**
 * Toggles the display of the info note.
 */
function infoNote() {
    let infoNote = document.getElementById('infoNote');
    if (infoNote.style.display === 'flex') {
        infoNote.style.display = 'none';
    } else {
        infoNote.style.display = 'flex';
    }
}

// All event listeners are grouped here for clarity.
window.addEventListener('DOMContentLoaded', init);
window.addEventListener("resize", checkOrientation);

window.addEventListener("keydown", (e) => {
    if (e.keyCode == 39) keybord.RIGHT = true;
    if (e.keyCode == 37) keybord.LEFT = true;
    if (e.keyCode == 32) keybord.SPACE = true;
    if (e.keyCode == 68) keybord.D = true;
});

window.addEventListener("keyup", (e) => {
    if (e.keyCode == 39) keybord.RIGHT = false;
    if (e.keyCode == 37) keybord.LEFT = false;
    if (e.keyCode == 32) keybord.SPACE = false;
    if (e.keyCode == 68) keybord.D = false;
});


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

function checkOrientation() {
    // This function remains unchanged from your version.
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