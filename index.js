function handleGameStart() {
  if (window.navigator.userAgentData.mobile === true) {
    mobileDeviceFound();
  } else if (window.navigator.userAgentData.mobile === false) {
    window.location.href = `game.html`;
  }
}
function getDifficultyLevel(numeral) {
  switch (numeral) {
    case 1:
      return "Easy";
    case 2:
      return "Medium";
    case 3:
      return "Hard";
    case 4:
      return "Impossible";
    default:
      return "Unknown";
  }
}
function difficultyDisplay() {
  const difficultyValue = parseInt(document.getElementById("difficulty").value);
  const level = getDifficultyLevel(difficultyValue);
  document.getElementById(
    "difficulty-display"
  ).innerText = `Difficulty: ${level}`;
  localStorage.setItem("html-shooter-difficulty", difficultyValue);
}
document
  .getElementById("difficulty")
  .addEventListener("input", difficultyDisplay);

difficultyDisplay();
