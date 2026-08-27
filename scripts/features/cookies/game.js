(function initCookieGame(globalScope) {
  var ROUND_MS = 30000;
  var SPAWN_START_MS = 1800;
  var SPAWN_END_MS = 800;

  var cookieGame = { running: false, started: false, score: 0, streak: 0, endsAt: 0, timer: null, spawnTimer: null, frame: null, cookies: [] };

  function cookieGameElements() {
    return {
      root: document.getElementById("cookie-game"),
      hud: document.getElementById("cookie-game-hud") || document.querySelector(".cookie-game__hud"),
      score: document.getElementById("cookie-game-score"),
      time: document.getElementById("cookie-game-time"),
      streak: document.getElementById("cookie-game-streak"),
      status: document.getElementById("cookie-game-status")
    };
  }

  function formatTime(seconds) {
    return Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
  }

  function setOverlayHidden(element, hidden) {
    if (!element) return;
    element.hidden = hidden;
    element.setAttribute("aria-hidden", hidden ? "true" : "false");
  }

  function remainingSeconds() {
    if (!cookieGame.started || !cookieGame.endsAt) {
      return ROUND_MS / 1000;
    }
    return Math.max(0, Math.ceil((cookieGame.endsAt - Date.now()) / 1000));
  }

  function clearCookieGameTimers() {
    clearInterval(cookieGame.timer);
    clearTimeout(cookieGame.spawnTimer);
    clearInterval(cookieGame.spawnTimer);
    cancelAnimationFrame(cookieGame.frame);
    cookieGame.timer = null;
    cookieGame.spawnTimer = null;
    cookieGame.frame = null;
  }

  function clearCookieGameCookies() {
    cookieGame.cookies.forEach(function (cookie) { cookie.remove(); });
    cookieGame.cookies = [];
  }

  function hideCatchWindow() {
    var el = cookieGameElements();
    setOverlayHidden(el.hud, true);
    if (el.root) {
      el.root.hidden = true;
      el.root.setAttribute("aria-hidden", "true");
    }
  }

  function endCookieGame() {
    cookieGame.running = false;
    cookieGame.started = false;
    cookieGame.endsAt = 0;
    clearCookieGameTimers();
    clearCookieGameCookies();
    hideCatchWindow();
    if (typeof showCookiesBanner === "function") {
      showCookiesBanner();
    }
  }

  function closeCookieGame() {
    endCookieGame();
  }

  function finishCookieGame() {
    if (!cookieGame.running || !cookieGame.started || !cookieGame.endsAt) return;
    if (remainingSeconds() > 0) return;
    endCookieGame();
  }

  function updateCookieGameHud() {
    if (!cookieGame.started) return;
    var el = cookieGameElements();
    var remaining = remainingSeconds();
    el.score.textContent = cookieGame.score;
    el.time.textContent = formatTime(remaining);
    el.streak.textContent = cookieGame.streak > 1 ? cookieGame.streak + " streak" : "";
    if (cookieGame.endsAt && remaining === 0) finishCookieGame();
  }

  function spawnDelayMs() {
    var elapsed = Date.now() - (cookieGame.endsAt - ROUND_MS);
    var progress = Math.max(0, Math.min(1, elapsed / ROUND_MS));
    return SPAWN_START_MS + (SPAWN_END_MS - SPAWN_START_MS) * progress;
  }

  function cookieFallDuration() {
    if (!cookieGame.started || !cookieGame.endsAt) {
      return (5.2 + Math.random() * 1.6) + "s";
    }
    var elapsed = Date.now() - (cookieGame.endsAt - ROUND_MS);
    var progress = Math.max(0, Math.min(1, elapsed / ROUND_MS));
    return ((5.2 - progress * 1.0) + Math.random() * 1.8) + "s";
  }

  function scheduleNextSpawn() {
    if (!cookieGame.running || !cookieGame.started || !cookieGame.endsAt) return;
    if (remainingSeconds() <= 0) return;
    cookieGame.spawnTimer = setTimeout(function onSpawnTick() {
      if (!cookieGame.running || !cookieGame.started) return;
      spawnCookie();
      scheduleNextSpawn();
    }, spawnDelayMs());
  }

  function spawnCookie() {
    if (!cookieGame.running) return;
    var el = cookieGameElements(), cookie = document.createElement("button");
    cookie.type = "button";
    cookie.className = "cookie-game__cookie clickable";
    cookie.setAttribute("aria-label", "Catch cookie");
    cookie.innerHTML = '<img src="images/cookie.png" alt="">';
    cookie.style.left = (4 + Math.random() * 92) + "vw";
    cookie.style.setProperty("--cookie-duration", cookieFallDuration());
    cookie.style.setProperty("--cookie-size", (38 + Math.random() * 16) + "px");
    cookie.addEventListener("click", function () {
      if (!cookieGame.running || cookie.dataset.caught === "true") return;
      cookie.dataset.caught = "true";
      cookie.style.pointerEvents = "none";
      cookieGame.score += 1;
      cookieGame.streak += 1;
      var rect = cookie.getBoundingClientRect();
      var feedback = document.createElement("span");
      feedback.className = "cookie-game__feedback";
      feedback.textContent = "+1";
      feedback.style.left = (rect.right + 5) + "px";
      feedback.style.top = rect.top + "px";
      el.root.appendChild(feedback);
      cookie.remove();
      cookieGame.cookies = cookieGame.cookies.filter(function (item) { return item !== cookie; });
      el.status.textContent = "Cookie caught. Score " + cookieGame.score + ".";
      setTimeout(function () { feedback.remove(); }, 500);
      if (cookieGame.started) updateCookieGameHud();
    });
    cookie.addEventListener("animationend", function () {
      cookieGame.streak = 0;
      cookie.remove();
      cookieGame.cookies = cookieGame.cookies.filter(function (item) { return item !== cookie; });
    });
    el.root.appendChild(cookie);
    cookieGame.cookies.push(cookie);
  }

  function beginRoundFromFirstCatch() {
    if (cookieGame.started) return;
    cookieGame.started = true;
    cookieGame.endsAt = Date.now() + ROUND_MS;
    setOverlayHidden(cookieGameElements().hud, false);
    updateCookieGameHud();
    cookieGame.timer = setInterval(updateCookieGameHud, 250);
    scheduleNextSpawn();
  }

  function startCookieGame() {
    var el = cookieGameElements();
    if (!el.root) return;
    clearCookieGameTimers();
    clearCookieGameCookies();
    cookieGame = { running: true, started: false, score: 0, streak: 0, endsAt: 0, timer: null, spawnTimer: null, frame: null, cookies: [] };
    globalScope.cookieGame = cookieGame;
    el.root.hidden = false;
    el.root.setAttribute("aria-hidden", "false");
    setOverlayHidden(el.hud, true);
    el.score.textContent = "0";
    el.time.textContent = formatTime(ROUND_MS / 1000);
    el.streak.textContent = "";
    el.status.textContent = "Catch the cookie to start the 30 second timer.";
    spawnCookie();
    var firstCookie = cookieGame.cookies[0];
    firstCookie.addEventListener("click", beginRoundFromFirstCatch, { once: true });
  }

  globalScope.cookieGame = cookieGame;
  globalScope.startCookieGame = startCookieGame;
  globalScope.closeCookieGame = closeCookieGame;
})(window);
