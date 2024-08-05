import { Game_Music, GameOverSound } from "./audio.js";
import { handleGameStart } from "./utils.js";
import {
  calculateframes,
  enemyMotion,
  handleKeyDown,
  handleKeyUp,
  handleShoot,
  bulletMotion,
  start_spawning,
} from "./controller.js";
import {
  bullets,
  enemies,
  enemyCount,
  lost_game,
  mouseX,
  mouseY,
  playerTop,
  playerLeft,
} from "./config.js";

let elaspedTime = 0;
let deltaTime = 0;

let score = 0;
let spawningID;
const player = document.getElementById("player1");
const body = document.getElementsByTagName("body")[0];
const scoreBoard = document.getElementById("score");
const main_display = document.getElementById("display");
const resetButton = document.getElementById("resetButton");
const startButton = document.getElementById("start-button");
const indexErrorDiv = document.getElementById("error");

startButton.addEventListener("click", handleGameStart);
resetButton.addEventListener("click", resetGame);
console.log("hello: start: ", startButton, typeof startButton);
// rotation
window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});
// player movement
window.addEventListener("keydown", (e) => {
  handleKeyDown(e);
});
window.addEventListener("keyup", (e) => {
  handleKeyUp(e);
});
window.addEventListener("touch", mobileDeviceFound);
// shooting
window.addEventListener("click", (e) => {
  if (!lost_game) {
    handleShoot();
  }
});
window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  if (!lost_game) {
    handleShoot();
  }
});

function movePlayer() {
  player.style.top = `${playerTop + PLAYER_OFFSET_Y}px`;
  player.style.left = `${playerLeft + PLAYER_OFFSET_X}px`;
  player.style.rotate = angle_in_deg + "deg";
}
function resetGame() {
  player.classList.remove("fadeaway");
  main_display.classList.remove("fadein");
  resetButton.classList.remove("fadein");
  GameOverSound.pause();
  GameOverSound.currentTime = 0;
  main_display.style.display = "none";
  resetButton.style.display = "none";

  enemies.forEach((enemy) => {
    enemy.remove();
  });
  enemies = [];
  enemyCount = 0;

  bullets.forEach((bulletObject) => {
    bulletObject.element.remove();
  });
  bullets = [];
  bulletCount = 0;

  playerTop = 0;
  playerLeft = 0;
  score = 0;
  lost_game = false;

  // Restart the game loop
  start_spawning();
  gameLoop();
}

function gameLoop(time) {
  Game_Music.play();
  deltaTime = time - elaspedTime;
  movePlayer(deltaTime);
  calculateframes(deltaTime);
  bulletMotion(deltaTime);
  enemyMotion(deltaTime);
  updateScore();

  elaspedTime += deltaTime;
  if (lost_game) {
    display_end_screen();
    return;
  }
  requestAnimationFrame(gameLoop);
}
start_spawning();
gameLoop();
