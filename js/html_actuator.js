function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");

  this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continue = function (restart) {
  if (typeof ga !== "undefined") {
    ga("send", "event", window.gameName || "game", restart ? "restart" : "keep playing");
  }
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  if (tile.value > 67108864) {
    var classes = ["tile", "tile-" + "2-" + Math.log2(tile.value), positionClass];
  }
  else {
    var classes = ["tile", "tile-" + tile.value, positionClass];
  }
  var value = tile.value;

  if (value > Math.pow(2, 200)) classes.push("tile-super");
  if (value >= Math.pow(10, 66)) {
     value = Math.floor(value / Math.pow(10, 66)) + "UV";
  }
  else if (value >= Math.pow(10, 63)) {
     value = Math.floor(value / Math.pow(10, 63)) + "V";
  }
  else if (value >= Math.pow(10, 60)) {
     value = Math.floor(value / Math.pow(10, 60)) + "ND";
  }
  else if (value >= Math.pow(10, 57)) {
     value = Math.floor(value / Math.pow(10, 57)) + "OcD";
  }
  else if (value >= Math.pow(10, 54)) {
     value = Math.floor(value / Math.pow(10, 54)) + "SpD";
  }
  else if (value >= Math.pow(10, 51)) {
     value = Math.floor(value / Math.pow(10, 51)) + "SxD";
  }
  else if (value >= Math.pow(10, 48)) {
     value = Math.floor(value / Math.pow(10, 48)) + "QiD";
  }
  else if (value >= Math.pow(10, 45)) {
     value = Math.floor(value / Math.pow(10, 45)) + "QD";
  }
  else if (value >= Math.pow(10, 42)) {
     value = Math.floor(value / Math.pow(10, 42)) + "TD";
  }
  else if (value >= Math.pow(10, 39)) {
     value = Math.floor(value / Math.pow(10, 39)) + "DD";
  }
  else if (value >= Math.pow(10, 36)) {
     value = Math.floor(value / Math.pow(10, 36)) + "UD";
  }
  else if (value >= Math.pow(10, 33)) {
     value = Math.floor(value / Math.pow(10, 33)) + "D";
  }
  else if (value >= Math.pow(10, 30)) {
     value = Math.floor(value / Math.pow(10, 30)) + "N";
  }
  else if (value >= Math.pow(10, 27)) {
     value = Math.floor(value / Math.pow(10, 27)) + "Oc";
  }
  else if (value >= Math.pow(10, 24)) {
     value = Math.floor(value / Math.pow(10, 24)) + "Sp";
  }
  else if (value >= Math.pow(10, 21)) {
     value = Math.floor(value / Math.pow(10, 21)) + "Sx";
  }
  else if (value >= Math.pow(10, 18)) {
     value = Math.floor(value / Math.pow(10, 18)) + "Qi";
  }
  else if (value >= Math.pow(10, 15)) {
     value = Math.floor(value / Math.pow(10, 15)) + "Q";
  }
  else if (value >= Math.pow(10, 12)) {
     value = Math.floor(value / Math.pow(10, 12)) + "T";
  }
  else if (value >= Math.pow(10, 9)) {
     value = Math.floor(value / Math.pow(10, 9)) + "B";
  }
  else if (value >= Math.pow(10, 8)) {
     value = Math.floor(value / Math.pow(10, 6)) + "M";
  }

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.textContent = tile.type === 'number' ? value : '×' + value;

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "You win!" : "Game over!";
  if (typeof ga !== "undefined") {
    ga("send", "event", window.gameName || "game", "end", type, this.score);
  }

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};
