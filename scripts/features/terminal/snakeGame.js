(function initTerminalSnakeGame(globalScope) {
  function createTerminalSnakeGame(options) {
    var width = options.width || 18;
    var height = options.height || 12;
    var tickMs = options.tickMs || 130;
    var onFrame = options.onFrame || function noop() {};
    var onStatus = options.onStatus || function noop() {};
    var isBlocked = options.isBlocked || function noopBlocked() { return false; };

    var running = true;
    var score = 0;
    var direction = { x: 1, y: 0 };
    var pendingDirection = { x: 1, y: 0 };
    var snake = [{ x: Math.floor(width / 2), y: Math.floor(height / 2) }];
    var food = spawnFood();

    function spawnFood() {
      while (true) {
        var candidate = {
          x: globalScope.AppUtils.getRandomInt(0, width - 1),
          y: globalScope.AppUtils.getRandomInt(0, height - 1),
        };
        var occupied = snake.some(function segmentMatches(segment) {
          return segment.x === candidate.x && segment.y === candidate.y;
        });
        if (!occupied) {
          return candidate;
        }
      }
    }

    function setDirection(nextX, nextY) {
      if (!running) {
        return;
      }
      // Ignore 180 degree turns.
      if (nextX === -direction.x && nextY === -direction.y) {
        return;
      }
      pendingDirection = { x: nextX, y: nextY };
    }

    function stop() {
      running = false;
    }

    function renderBoard(extraLine) {
      var rows = [];
      rows.push("+" + "-".repeat(width) + "+");
      for (var y = 0; y < height; y += 1) {
        var row = "|";
        for (var x = 0; x < width; x += 1) {
          var isHead = snake[0].x === x && snake[0].y === y;
          var isBody = !isHead && snake.some(function bodyMatches(segment, idx) {
            return idx > 0 && segment.x === x && segment.y === y;
          });
          if (isHead) {
            row += "@";
          } else if (isBody) {
            row += "o";
          } else if (food.x === x && food.y === y) {
            row += "*";
          } else {
            row += " ";
          }
        }
        row += "|";
        rows.push(row);
      }
      rows.push("+" + "-".repeat(width) + "+");
      rows.push("Score: " + score);
      if (extraLine) {
        rows.push(extraLine);
      }
      return rows.join("\n");
    }

    async function run() {
      onStatus("started");
      onFrame(renderBoard("Controls: arrows/WASD, Ctrl+C to quit"));
      while (running && !isBlocked()) {
        await globalScope.AppUtils.delay(tickMs);
        if (!running || isBlocked()) {
          break;
        }

        direction = pendingDirection;
        var nextHead = {
          x: snake[0].x + direction.x,
          y: snake[0].y + direction.y,
        };

        var hitWall = nextHead.x < 0 || nextHead.x >= width || nextHead.y < 0 || nextHead.y >= height;
        var hitSelf = snake.some(function sameCell(segment) {
          return segment.x === nextHead.x && segment.y === nextHead.y;
        });

        if (hitWall || hitSelf) {
          running = false;
          onFrame(renderBoard("Game over. Final score: " + score));
          onStatus("gameover", score);
          return { reason: "gameover", score: score };
        }

        snake.unshift(nextHead);
        if (nextHead.x === food.x && nextHead.y === food.y) {
          score += 1;
          if (snake.length === width * height) {
            running = false;
            onFrame(renderBoard("You win! Final score: " + score));
            onStatus("won", score);
            return { reason: "won", score: score };
          }
          food = spawnFood();
        } else {
          snake.pop();
        }

        onFrame(renderBoard());
      }

      onFrame(renderBoard("Snake interrupted."));
      onStatus("stopped", score);
      return { reason: "stopped", score: score };
    }

    return {
      run: run,
      setDirection: setDirection,
      stop: stop,
      isRunning: function isRunning() {
        return running;
      },
    };
  }

  globalScope.TerminalSnakeGame = {
    createTerminalSnakeGame: createTerminalSnakeGame,
  };
})(window);
