function mobileDeviceFound() {
  alert(
    "Game is not optimized for mobile devices. Please play on a desktop or laptop."
  );
}
function handleGameStart() {
  console.log("Starting game..");
  if (window.navigator.userAgentData.mobile === true) {
    mobileDeviceFound();
    indexErrorDiv.innerHTML =
      "Game is not optimized for mobile devices. Please play on a desktop or laptop.";
  } else if (window.navigator.userAgentData.mobile === false) {
    window.location.href = "game.html";
  }
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

  main_display.innerHTML = `<h3>YOU LOST!</h3> <br>Score: ${score}`;
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

// export all functions
export { handleGameStart, mobileDeviceFound, updateScore, display_end_screen };
