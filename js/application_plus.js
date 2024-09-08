// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
  window.gameName = '2048-advanced-plus';
  new GameManager(8, KeyboardInputManager, HTMLActuator, LocalScoreManager);
});
