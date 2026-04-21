var GooseVirus = (function() {
    var body = null;
    var neck = null;
    var head = null;
    var nose = null;
    var speech = null;
    var footprintsLayer = null;
    var giftsLayer = null;

    var isRunning = false;
    var isDomReady = false;
    var lastFrame = 0;
    var lastStepAt = 0;
    var lastStatePickAt = 0;
    var lastStealAt = -10000;
    var stealUntil = 0;
    var audioContext = null;

    var position = { x: 0, y: 0 };
    var velocity = { x: 0, y: 0 };
    var target = { x: 0, y: 0 };
    var mode = "idle";
    var dragGift = null;

    var TAUNTS = [
        "i cause problems on purpose",
        "you look productive, not for long",
        "honk if you love deadlines",
        "skills removed. icon stays.",
        "this is your break reminder",
    ];

    function randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(value, max));
    }

    function distance(ax, ay, bx, by) {
        var dx = bx - ax;
        var dy = by - ay;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function getViewportTarget() {
        return {
            x: randomRange(window.innerWidth * 0.08, window.innerWidth * 0.82),
            y: randomRange(window.innerHeight * 0.08, window.innerHeight * 0.75),
        };
    }

    function ensureDom() {
        if (isDomReady) {
            return true;
        }

        body = document.getElementById("goose1");
        neck = document.getElementById("goose_neck1");
        head = document.getElementById("goose_head1");
        nose = document.getElementById("goose_nose1");
        if (!body || !neck || !head || !nose) {
            return false;
        }

        body.classList.add("goose-root");
        body.style.pointerEvents = "auto";
        body.addEventListener("mousedown", function onGoosePoke(evt) {
            evt.stopPropagation();
            mode = "chase";
            lastStatePickAt = performance.now() + randomRange(1800, 2600);
            say("honk!");
            playHonk(720);
        });

        speech = document.createElement("div");
        speech.className = "goose-speech";
        body.appendChild(speech);

        footprintsLayer = document.createElement("div");
        footprintsLayer.className = "goose-trail-container";
        document.body.appendChild(footprintsLayer);

        giftsLayer = document.createElement("div");
        giftsLayer.className = "goose-gifts-container";
        document.body.appendChild(giftsLayer);

        isDomReady = true;
        return true;
    }

    function playHonk(frequency) {
        try {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            var now = audioContext.currentTime;
            var osc = audioContext.createOscillator();
            var gain = audioContext.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(frequency || 680, now);
            osc.frequency.exponentialRampToValueAtTime((frequency || 680) * 0.55, now + 0.12);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.start(now);
            osc.stop(now + 0.2);
        } catch (err) {
            // Audio can fail before user interaction; goose continues silently.
        }
    }

    function say(text) {
        if (!speech) {
            return;
        }
        speech.textContent = text || "";
        speech.style.opacity = text ? "1" : "0";
    }

    function dropFootstep(now) {
        if (!footprintsLayer || now - lastStepAt < 140) {
            return;
        }
        lastStepAt = now;
        var step = document.createElement("div");
        step.className = "goose-footstep";
        step.style.left = (position.x + 20 + randomRange(-6, 10)) + "px";
        step.style.top = (position.y + 30 + randomRange(-6, 6)) + "px";
        step.style.transform = "rotate(" + randomRange(-30, 30) + "deg)";
        footprintsLayer.appendChild(step);
        setTimeout(function() {
            step.remove();
        }, 3200);
    }

    function createGiftWindow() {
        if (!giftsLayer) {
            return null;
        }

        var gift = document.createElement("div");
        gift.className = "goose-gift-window";
        gift.innerHTML =
            '<div class="goose-gift-title">Goose "Not-epad"</div>' +
            '<div class="goose-gift-content"></div>';

        var content = gift.querySelector(".goose-gift-content");
        if (content) {
            content.textContent = TAUNTS[Math.floor(Math.random() * TAUNTS.length)];
        }

        gift.style.left = "-360px";
        gift.style.top = randomRange(window.innerHeight * 0.15, window.innerHeight * 0.65) + "px";
        giftsLayer.appendChild(gift);
        return gift;
    }

    function startDragGift() {
        var gift = createGiftWindow();
        if (!gift) {
            return;
        }
        dragGift = {
            node: gift,
            targetX: randomRange(window.innerWidth * 0.25, window.innerWidth * 0.72),
            targetY: randomRange(window.innerHeight * 0.16, window.innerHeight * 0.63),
        };

        position.x = -90;
        position.y = randomRange(window.innerHeight * 0.2, window.innerHeight * 0.72);
        velocity.x = 0;
        velocity.y = 0;
        target.x = dragGift.targetX;
        target.y = dragGift.targetY;
        mode = "dragging";
        say("gift.");
        playHonk(640);
    }

    function releaseDragGift() {
        if (!dragGift || !dragGift.node) {
            dragGift = null;
            return;
        }
        var giftToRemove = dragGift.node;
        giftToRemove.classList.add("goose-gift-window-idle");
        setTimeout(function() {
            giftToRemove.remove();
        }, 18000);
        dragGift = null;
    }

    function pickNextMode(now) {
        if (now < lastStatePickAt || mode === "dragging" || mode === "steal") {
            return;
        }

        var roll = Math.random();
        if (roll < 0.18) {
            startDragGift();
            lastStatePickAt = now + randomRange(2600, 4200);
            return;
        }
        if (roll < 0.45) {
            mode = "wander";
            target = getViewportTarget();
            say("");
            lastStatePickAt = now + randomRange(1500, 3400);
            return;
        }
        if (roll < 0.72) {
            mode = "chase";
            say("...");
            lastStatePickAt = now + randomRange(1200, 2600);
            return;
        }
        mode = "idle";
        say("");
        lastStatePickAt = now + randomRange(800, 1800);
    }

    function maybeStealCursor(now) {
        if (mode !== "chase" || now - lastStealAt < 6400) {
            return;
        }
        var cursorX = typeof getGhostXCursor === "function" ? getGhostXCursor() : target.x;
        var cursorY = typeof getGhostYCursor === "function" ? getGhostYCursor() : target.y;
        if (distance(position.x + 60, position.y + 16, cursorX, cursorY) < 40) {
            mode = "steal";
            stealUntil = now + 2200;
            lastStealAt = now;
            say("mine");
            playHonk(830);
        }
    }

    function updateGiftPosition() {
        if (!dragGift || !dragGift.node) {
            return;
        }
        dragGift.node.style.left = (position.x + 70) + "px";
        dragGift.node.style.top = (position.y - 14) + "px";
    }

    function updateTarget(now) {
        if (mode === "idle") {
            target.x = position.x;
            target.y = position.y;
            return;
        }

        if (mode === "wander") {
            if (distance(position.x, position.y, target.x, target.y) < 26) {
                target = getViewportTarget();
            }
            return;
        }

        if (mode === "chase") {
            target.x = typeof getGhostXCursor === "function" ? getGhostXCursor() : position.x;
            target.y = typeof getGhostYCursor === "function" ? getGhostYCursor() : position.y;
            maybeStealCursor(now);
            return;
        }

        if (mode === "steal") {
            target.x = clamp(position.x + randomRange(18, 42), 0, window.innerWidth - 80);
            target.y = clamp(position.y + randomRange(-22, 22), 0, window.innerHeight - 52);
            if (typeof setGhostCursorPosition === "function") {
                setGhostCursorPosition(position.x + 62, position.y + 16);
            }
            if (now >= stealUntil) {
                mode = "wander";
                target = getViewportTarget();
                say("honk.");
                if (typeof releaseGhostCursor === "function") {
                    releaseGhostCursor();
                }
            }
            return;
        }

        if (mode === "dragging") {
            target.x = dragGift ? dragGift.targetX : target.x;
            target.y = dragGift ? dragGift.targetY : target.y;
            if (distance(position.x, position.y, target.x, target.y) < 22) {
                releaseDragGift();
                mode = "idle";
                lastStatePickAt = now + randomRange(700, 1800);
                say("enjoy.");
            }
        }
    }

    function applyMotion(dt, now) {
        var speed = 24;
        if (mode === "wander") {
            speed = 80;
        } else if (mode === "chase") {
            speed = 145;
        } else if (mode === "steal") {
            speed = 170;
        } else if (mode === "dragging") {
            speed = 100;
        }

        var dx = target.x - position.x;
        var dy = target.y - position.y;
        var distanceToTarget = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        var desiredX = (dx / distanceToTarget) * speed;
        var desiredY = (dy / distanceToTarget) * speed;
        var blend = clamp(dt * 6.5, 0.08, 0.45);
        velocity.x += (desiredX - velocity.x) * blend;
        velocity.y += (desiredY - velocity.y) * blend;
        velocity.x *= 0.94;
        velocity.y *= 0.94;

        position.x += velocity.x * dt;
        position.y += velocity.y * dt;
        position.x = clamp(position.x, -120, window.innerWidth - 80);
        position.y = clamp(position.y, 0, window.innerHeight - 54);

        if (mode !== "idle") {
            dropFootstep(now);
        }
    }

    function updatePose(now) {
        var moveAngle = Math.atan2(velocity.y, velocity.x || 0.001);
        var waddle = Math.sin(now / 90) * 4;
        body.style.left = position.x + "px";
        body.style.top = position.y + "px";
        body.style.transform = "rotate(" + moveAngle + "rad)";
        body.setAttribute("data-goose-mode", mode);
        neck.style.bottom = (8 + waddle * 0.25) + "px";
        head.style.bottom = (29 + waddle * 0.42) + "px";
        nose.style.bottom = (18 + waddle * 0.55) + "px";
    }

    function frame(now) {
        if (!isRunning) {
            return;
        }
        if (!lastFrame) {
            lastFrame = now;
        }
        var dt = Math.min(0.05, (now - lastFrame) / 1000);
        lastFrame = now;

        pickNextMode(now);
        updateTarget(now);
        applyMotion(dt, now);
        updatePose(now);
        updateGiftPosition();

        requestAnimationFrame(frame);
    }

    function start() {
        if (!ensureDom()) {
            return;
        }
        body.style.display = "block";
        if (isRunning) {
            mode = "chase";
            say("back.");
            return;
        }

        position.x = Math.max(0, window.innerWidth * 0.12);
        position.y = Math.max(0, window.innerHeight * 0.45);
        target = getViewportTarget();
        mode = "wander";
        say("honk");
        isRunning = true;
        requestAnimationFrame(frame);
    }

    return {
        start: start,
    };
})();

function showGoose() {
    GooseVirus.start();
}






