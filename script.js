let playerTop = 0;
let playerLeft = 0;
let current_speed = 5;
let elaspedTime = 0;
let deltaTime = 0;
let bullets = [];
let bulletCount = 0;
let enemies = [];
let enemyCount = 0;
let mouseX = 0, mouseY = 0, angle_in_deg;
let keysPressed = {};
let lost_game = false;
let spawningID;

let player = document.getElementById("player1");
let body = document.getElementsByTagName("body")[0];
let scoreBoard = document.getElementById("score");
let main_display = document.getElementById("display");
let resetButton = document.getElementById("resetButton");


let score = 0;

const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 60;

const SPEED = 5;
const BULLET_SPEED = 10;
const ENEMY_SPEED = 2;
const MAX_BULLETS = 10;
const MAX_ENEMIES = 10;
const ENEMY_MINW = 40;
const ENEMY_MAXW = 50;
const SPAWN_RATE = 1000; // in ms


// audio
const Audio_Shoot = new Audio(`Audio\\shoot1.mp3`)



body.style.width = `${screen.width}px`;
body.style.height = `${screen.height}px`;


// Utilities
function max(a, b) {
  return (a > b) ? a : b;
}



// Render movement
function movePlayer() {
  player.style.top = `${playerTop}px`;
  player.style.left = `${playerLeft}px`;
  player.style.rotate = angle_in_deg + "deg";
}

function calculateframes(deltaTime) {

  // let dt =  deltaTime / 100;
  let dt = 1;
  if (keysPressed["w"]) {
    playerTop -= current_speed * dt;
  }
  if (keysPressed["a"]) {
    playerLeft -= current_speed * dt;
  }
  if (keysPressed["s"]) {
    playerTop += current_speed * dt;
  }
  if (keysPressed["d"]) {
    playerLeft += current_speed * dt;
  }
  if (keysPressed[" "]) {
    current_speed = SPEED * 2;
  }
  if (!keysPressed[" "]) {
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

  let angle_in_rad = Math.atan2(mouseY - player.offsetTop, mouseX - player.offsetLeft)
  angle_in_deg = angle_in_rad * (180 / Math.PI);
}

function bulletMotion(dt) {
  dt = 1;
  bullets.forEach((bulletObject, bulletIndex) => {
    let bullet = bulletObject.element;
    let bulletY = parseInt(bullet.style.top.replace("px", ""));
    let bulletX = parseInt(bullet.style.left.replace("px", ""));


    // Check collision with each enemy
    enemies.forEach((enemy, enemyIndex) => {
      let enemyTop = parseInt(enemy.style.top.replace("px", ""));
      let enemyLeft = parseInt(enemy.style.left.replace("px", ""));

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

    if (bulletX < 0 || bulletY < 0 || bulletY > body.clientHeight || bulletX > body.clientWidth) {
      destroyBullet(bulletObject, bulletIndex)
    }

    bullet.style.top = `${bulletY}px`;
    bullet.style.left = `${bulletX}px`;

  })

}

function enemyMotion(dt) {
  dt = 1;
  enemies.forEach((enemy) => {

    let enemyTop = parseInt(enemy.style.top.replace("px", ""));
    let enemyLeft = parseInt(enemy.style.left.replace("px", ""));

    let angle_to_player = Math.atan2(playerTop - enemy.offsetTop, playerLeft - enemy.offsetLeft);
    enemyTop += ENEMY_SPEED * dt * Math.sin(angle_to_player);
    enemyLeft += ENEMY_SPEED * dt * Math.cos(angle_to_player);

    let playerX = (playerLeft + PLAYER_WIDTH / 2);
    let playerY = (playerTop + PLAYER_HEIGHT / 2);


    // Simple bounding box collision detection
    if (
      playerY < (enemyTop + enemy.clientHeight) &&
      playerY > (enemyTop) &&
      playerX < (enemyLeft + enemy.clientWidth) &&
      playerX > (enemyLeft)
    ) {
      lost_game = true;
    }


    enemy.style.top = `${enemyTop}px`;
    enemy.style.left = `${enemyLeft}px`;

  })
}



function handleKeyDown(e) {
  keysPressed[e.key] = true;
}

function handleKeyUp(e) {
  keysPressed[e.key] = false;
}

function handleShoot(e) {

  Audio_Shoot.play();
  let bullet = document.createElement("div");
  bullet.className = "bullet";
  bullet.style.top = `${player.offsetTop}px`;
  bullet.style.left = `${player.offsetLeft}px`;
  body.appendChild(bullet);


  let bulletObject = {
    element: bullet,
    angle_in_rad: (angle_in_deg) * Math.PI / 180,
    rendering: true
  }

  bulletCount++;
  bullets.push(bulletObject);
 

  if (bulletCount >= MAX_BULLETS) {
    destroyBullet(bullets[0], 0);
    destroyBullet(bullets[0], 0);
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
  scoreBoard.innerHTML = `Score: ${score}`
}

function display_end_screen() {
  player.classList.add('fadeaway');

  enemies.forEach((enemy) => {
    enemy.classList.add('fadeaway');
  });

  clearInterval(spawningID);

  main_display.innerHTML = `<h3>YOU LOST!</h3> <br>Score: ${score}`;
  let highscore = window.localStorage.getItem("highscore");
  if (highscore == "null") {
    window.localStorage.setItem("highscore", "0");
    highscore = "0"
  }
  highscore = parseInt(highscore);
  if (score > highscore) {
    window.localStorage.setItem("highscore", `${score}`);
    main_display.innerHTML += "<br>NEW RECORD !!";
  }
  else {
    main_display.innerHTML += `<br>Previous best: ${highscore}`
  }
  main_display.style.display = "block";
  resetButton.style.display = "block";



}


function resetGame() {


  player.classList.remove('fadeaway');


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


resetButton.addEventListener("click", resetGame);

// rotation
window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
})

// player movement
window.addEventListener("keydown", (e) => {
  handleKeyDown(e);
});
window.addEventListener("keyup", (e) => {
  handleKeyUp(e);
});

// shooting
window.addEventListener("click", (e) => {
  handleShoot(e);
});


// Spawn enemies
function start_spawning() {
  spawningID = setInterval(() => {

    if (enemyCount <= MAX_ENEMIES) {

      let x = Math.random() * body.clientHeight;
      let y = Math.random() * body.clientWidth;
      let width = max(ENEMY_MINW, Math.random() * ENEMY_MAXW);

      let new_enemy = document.createElement('div');
      new_enemy.className = "enemy";
      new_enemy.style.top = `${y}px`;
      new_enemy.style.left = `${x}px`;
      new_enemy.style.width = `${width}px`;

      body.appendChild(new_enemy);

      enemies.push(new_enemy)
      enemyCount++;

    }
  }, SPAWN_RATE)
}


// Start the game loop
function gameLoop(time) {
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





