const difficulty = parseInt(localStorage.getItem("html-shooter-difficulty"));

let current_speed = 5;
let elaspedTime = 0;
let deltaTime = 0;
let bullets = [];
let bulletCount = 0;
let enemies = [];
let enemyCount = 0;
let mouseX = 0;
let mouseY = 0;
let angle_in_deg;
let keysPressed = {};
let lost_game = false;
let spawningID;
let score = 0;
let playerTop = screen.height / 2;
let playerLeft = screen.width / 2;
let PLAYER_OFFSET_X = 0;
let PLAYER_OFFSET_Y = 0;
let RELOADING = false;

const player = document.getElementById("player1");
const body = document.getElementsByTagName("body")[0];
const scoreBoard = document.getElementById("score");
const main_display = document.getElementById("display");
const resetButton = document.getElementById("resetButton");
const indexErrorDiv = document.getElementById("error");

const ENEMY_MINW = 40;
const ENEMY_MAXW = 50;
const BULLET_SPEED = 10;
const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 60;

let SPEED = 5;
let ENEMY_SPEED = 5;
let MAX_BULLETS = 5;
let MAX_ENEMIES = 40;
let SPAWN_RATE = 1000; // in ms

switch (difficulty) {
  case 1:
    SPEED = 6;
    ENEMY_SPEED = 1.5;
    MAX_ENEMIES = 10;
    MAX_BULLETS = 10;
    SPAWN_RATE = 3000;
    break;

  case 2:
    SPEED = 5;
    ENEMY_SPEED = 3.5;
    MAX_ENEMIES = 20;
    MAX_BULLETS = 7;
    SPAWN_RATE = 1000;
    break;
  case 3:
    SPEED = 4;
    ENEMY_SPEED = 6;
    MAX_ENEMIES = 40;
    MAX_BULLETS = 5;
    SPAWN_RATE = 1000;
    break;
  case 4:
    SPEED = 3;
    ENEMY_SPEED = 7;
    MAX_ENEMIES = 40;
    MAX_BULLETS = 4;
    SPAWN_RATE = 800;
    break;
  default:
    alert("Unknown difficulty");
}

// audio
const Audio_Shoot = new Audio(`Audio\\shoot1.mp3`);
const Game_Music = new Audio(`Audio\\game-music.mp3`);
const GameOverSound = new Audio(`Audio\\Gameover.mp3`);

const SHOOT_KEY_1 = "";
const SHOOT_KEY_2 = null;
const BOOST_KEY = " ";
const UP_KEY = "w" || "W";
const LEFT_KEY = "a" || "A";
const DOWN_KEY = "s" || "S";
const RIGHT_KEY = "d" || "D";
// body.style.width = `${screen.width}px`;
// body.style.height = `${screen.height}px`;

// Utilities
function max(a, b) {
  return a > b ? a : b;
}

function handleGameStart() {
  if (window.navigator.userAgentData.mobile === true) {
    mobileDeviceFound();
    indexErrorDiv.innerHTML =
      "Game is not optimized for mobile devices. Please play on a desktop or laptop.";
  } else if (window.navigator.userAgentData.mobile === false) {
    window.location.href = "game.html";
  }
}
// Render movement
function movePlayer() {
  player.style.top = `${playerTop + PLAYER_OFFSET_Y}px`;
  player.style.left = `${playerLeft + PLAYER_OFFSET_X}px`;
  player.style.rotate = angle_in_deg + "deg";
}

function calculateframes(deltaTime) {
  // const dt =  deltaTime / 100;
  const dt = 1;
  if (keysPressed[SHOOT_KEY_1] || keysPressed[SHOOT_KEY_2]) {
    handleShoot();
  }
  if (keysPressed[UP_KEY]) {
    playerTop -= current_speed * dt;
  }
  if (keysPressed[LEFT_KEY]) {
    playerLeft -= current_speed * dt;
  }
  if (keysPressed[DOWN_KEY]) {
    playerTop += current_speed * dt;
  }
  if (keysPressed[RIGHT_KEY]) {
    playerLeft += current_speed * dt;
  }
  if (keysPressed[BOOST_KEY]) {
    current_speed = SPEED * 2;
  }
  if (!keysPressed[BOOST_KEY]) {
    current_speed = SPEED;
  }

  if (playerTop < 0) playerTop = 0;
  if (playerLeft < 0) playerLeft = 0;
  if (playerTop > body.clientHeight - PLAYER_HEIGHT) {
    playerTop = body.clientHeight - PLAYER_HEIGHT;
  }
  if (playerLeft > body.clientWidth - PLAYER_WIDTH) {
    playerLeft = body.clientWidth - PLAYER_WIDTH;
  }

  const angle_in_rad = Math.atan2(
    mouseY - player.offsetTop,
    mouseX - player.offsetLeft
  );
  angle_in_deg = angle_in_rad * (180 / Math.PI);
}

function bulletMotion(dt) {
  dt = 1;
  bullets.forEach((bulletObject, bulletIndex) => {
    const bullet = bulletObject.element;
    let bulletY = parseInt(bullet.style.top.replace("px", ""));
    let bulletX = parseInt(bullet.style.left.replace("px", ""));

    // Check collision with each enemy
    enemies.forEach((enemy, enemyIndex) => {
      const enemyTop = parseInt(enemy.style.top.replace("px", ""));
      const enemyLeft = parseInt(enemy.style.left.replace("px", ""));

      // Simple bounding box collision detection
      if (
        bulletY < enemyTop + enemy.clientHeight &&
        bulletY + bullet.clientHeight > enemyTop &&
        bulletX < enemyLeft + enemy.clientWidth &&
        bulletX + bullet.clientWidth > enemyLeft
      ) {
        // Collision detected, destroy bullet and enemy
        score++;
        destroyBullet(bulletObject, bulletIndex);
        destroyEnemy(enemy, enemyIndex);
      }
    });

    bulletY += BULLET_SPEED * dt * Math.sin(bulletObject.angle_in_rad);
    bulletX += BULLET_SPEED * dt * Math.cos(bulletObject.angle_in_rad);

    if (
      bulletX < 0 ||
      bulletY < 0 ||
      bulletY > body.clientHeight ||
      bulletX > body.clientWidth
    ) {
      destroyBullet(bulletObject, bulletIndex);
    }
    // finally render
    bullet.style.top = `${bulletY}px`;
    bullet.style.left = `${bulletX}px`;
  });
}

function enemyMotion(dt) {
  dt = 1;
  enemies.forEach((enemy) => {
    let enemyTop = parseInt(enemy.style.top.replace("px", ""));
    let enemyLeft = parseInt(enemy.style.left.replace("px", ""));

    const angle_to_player = Math.atan2(
      playerTop - enemy.offsetTop,
      playerLeft - enemy.offsetLeft
    );
    enemyTop += ENEMY_SPEED * dt * Math.sin(angle_to_player);
    enemyLeft += ENEMY_SPEED * dt * Math.cos(angle_to_player);

    const playerX = playerLeft + PLAYER_WIDTH / 2;
    const playerY = playerTop + PLAYER_HEIGHT / 2;

    // Simple bounding box collision detection
    if (
      playerY < enemyTop + enemy.clientHeight &&
      playerY > enemyTop &&
      playerX < enemyLeft + enemy.clientWidth &&
      playerX > enemyLeft
    ) {
      lost_game = true;
    }
    // finally render
    enemy.style.top = `${enemyTop}px`;
    enemy.style.left = `${enemyLeft}px`;
  });
}

function handleKeyDown(e) {
  keysPressed[e.key] = true;
}

function handleKeyUp(e) {
  keysPressed[e.key] = false;
}

function handleShoot() {
  if (RELOADING) {
    return;
  }
  Audio_Shoot.play();
  const bullet = document.createElement("div");
  bullet.className = "bullet";
  bullet.style.top = `${player.offsetTop}px`;
  bullet.style.left = `${player.offsetLeft}px`;
  body.appendChild(bullet);

  const bulletObject = {
    element: bullet,
    angle_in_rad: (angle_in_deg * Math.PI) / 180,
    rendering: true,
  };

  bulletCount++;
  bullets.push(bulletObject);

  if (bulletCount >= MAX_BULLETS) {
    RELOADING = true;
    let color = player.style.borderLeftColor;
    player.style.borderLeftColor = "transparent";
    setTimeout(() => {
      RELOADING = false;
      player.style.borderLeftColor = color;
    }, 1000);
  }
}

function destroyBullet(bulletObject, index) {
  bullets.splice(index, 1);
  bulletObject.element.remove();
  bulletObject.rendering = false;
  bulletCount--;
}

function destroyEnemy(enemy, index) {
  enemies.splice(index, 1);
  enemy.remove();
  enemyCount--;
}

function updateScore() {
  scoreBoard.innerHTML = `Score: ${score}`;
}

function display_end_screen() {
  GameOverSound.play();
  Game_Music.pause();
  Game_Music.currentTime = 0;
  player.classList.add("fadeaway");

  enemies.forEach((enemy) => {
    enemy.classList.add("fadeaway");
  });

  clearInterval(spawningID);

  main_display.innerHTML = `<h3>YOU LOST !</h3> <br>Score: ${score}`;
  let highscore = window.localStorage.getItem("highscore");
  if (!highscore) {
    window.localStorage.setItem("highscore", 0);
    highscore = 0;
  }
  if (score > highscore) {
    window.localStorage.setItem("highscore", `${score}`);
    main_display.innerHTML += "<br>NEW RECORD !!";
  } else {
    main_display.innerHTML += `<br>Previous best: ${highscore}`;
  }
  setTimeout(() => {
    main_display.style.display = "block";
    resetButton.style.display = "block";
    main_display.classList.add("fadein");
    resetButton.classList.add("fadein");
  }, 4000);
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

  playerTop = screen.height / 2;
  playerLeft = screen.width / 2;
  score = 0;
  lost_game = false;

  // Restart the game loop
  start_spawning();
  gameLoop();
}

// startButton.addEventListener("click", handleGameStart);
resetButton.addEventListener("click", resetGame);

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
// window.addEventListener("contextmenu", (e) => {
//   e.preventDefault();
//   if (!lost_game) {
//     handleShoot();
//   }
// });

function mobileDeviceFound() {
  alert(
    "Game is not optimized for mobile devices. Please play on a desktop or laptop."
  );
}

// Spawn enemies
function start_spawning() {
  spawningID = setInterval(() => {
    if (enemyCount <= MAX_ENEMIES) {
      const x = Math.random() * body.clientHeight;
      const y = Math.random() * body.clientWidth;
      const width = max(ENEMY_MINW, Math.random() * ENEMY_MAXW);

      const new_enemy = document.createElement("div");
      new_enemy.className = "enemy";
      new_enemy.style.top = `${y}px`;
      new_enemy.style.left = `${x}px`;
      new_enemy.style.width = `${width}px`;

      body.appendChild(new_enemy);

      enemies.push(new_enemy);
      enemyCount++;
    }
  }, SPAWN_RATE);
}

// Start the game loop
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
