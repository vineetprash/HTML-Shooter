import {
  keysPressed,
  playerLeft,
  playerTop,
  mouseX,
  mouseY,
  bullets,
  angle_in_deg,
  enemies,
  enemyCount,
} from "./config.js";
export function calculateframes(deltaTime) {
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
export function bulletMotion(dt) {
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

export function enemyMotion(dt) {
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

export function handleKeyDown(e) {
  keysPressed[e.key] = true;
}

export function handleKeyUp(e) {
  keysPressed[e.key] = false;
}

export function handleShoot() {
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
    player.style.borderLeftColor = "grey";
    setTimeout(() => {
      RELOADING = false;
      player.style.borderLeftColor = "white";
    }, 1000);
  }
}

export function destroyBullet(bulletObject, index) {
  bullets.splice(index, 1);
  bulletObject.element.remove();
  bulletObject.rendering = false;
  bulletCount--;
}

export function destroyEnemy(enemy, index) {
  enemies.splice(index, 1);
  enemy.remove();
  enemyCount--;
}

// Spawn enemies
export function start_spawning() {
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
