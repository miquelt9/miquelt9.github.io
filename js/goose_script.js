var GooseVirus = (function() {
    var body = null;
    var neck = null;
    var head = null;
    var nose = null;
    var speech = null;

    var isRunning = false;
    var lastFrame = 0;
    var x = 0;
    var y = 0;
    var vx = 0;
    var vy = 0;
    var state = "hunt";
    var stateUntil = 0;
    var lastStepAt = 0;
    var lastWindowAnnoyAt = 0;
    var lastCursorStealAt = 0;
    var trailContainer = null;

    function randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    function ensureDom() {
        body = document.getElementById("goose1");
        neck = document.getElementById("goose_neck1");
        head = document.getElementById("goose_head1");
        nose = document.getElementById("goose_nose1");

        if (!body || !neck || !head || !nose) {
            return false;
        }

        if (!speech) {
            speech = document.createElement("div");
            speech.className = "goose-speech";
            body.appendChild(speech);
        }

        if (!trailContainer) {
            trailContainer = document.createElement("div");
            trailContainer.className = "goose-trail-container";
            document.body.appendChild(trailContainer);
        }

        return true;
    }

    function setSpeech(text) {
        if (!speech) {
            return;
        }
        speech.textContent = text;
        speech.style.opacity = text ? "1" : "0";
    }

    function spawnFootstep(now) {
        if (!trailContainer || now - lastStepAt < 120) {
            return;
        }
        lastStepAt = now;
        var step = document.createElement("div");
        step.className = "goose-footstep";
        step.style.left = (x + 26 + randomRange(-8, 8)) + "px";
        step.style.top = (y + 24 + randomRange(-4, 6)) + "px";
        step.style.transform = "rotate(" + randomRange(-20, 20) + "deg)";
        trailContainer.appendChild(step);
        setTimeout(function() { step.remove(); }, 3200);
    }

    function annoyDesktop(now) {
        if (now - lastWindowAnnoyAt < 2800 || !window.WindowManager) {
            return;
        }
        lastWindowAnnoyAt = now;

        var activeWindows = window.WindowManager.boxes
            .map(function(id) { return document.getElementById(id); })
            .filter(function(el) { return el && el.style.display !== "none"; });

        if (activeWindows.length === 0) {
            return;
        }

        var victim = activeWindows[Math.floor(Math.random() * activeWindows.length)];
        victim.style.left = (victim.offsetLeft + randomRange(-60, 60)) + "px";
        victim.style.top = (victim.offsetTop + randomRange(-35, 35)) + "px";
        window.WindowManager.bringToFront(victim.id);
        setSpeech("honk.");
    }

    function updatePose(angle) {
        var angleDeg = angle * 57.2957795;
        nose.style.bottom = -((Math.abs(angleDeg) - 90) / 2.5) - 9 + "px";
        neck.style.bottom = -((Math.abs(angleDeg) - 90) / 5) + 5 + "px";
        head.style.bottom = -((Math.abs(angleDeg) - 90) / 3) + 3 + "px";
        body.style.rotate = angle + "rad";
    }

    function chooseState(now) {
        if (now < stateUntil) {
            return;
        }

        var states = ["hunt", "wander", "steal"];
        state = states[Math.floor(Math.random() * states.length)];
        if (state === "steal" && now - lastCursorStealAt < 2500) {
            state = "hunt";
        }
        stateUntil = now + randomRange(900, 2100);
    }

    function updateVelocity(now) {
        var targetX = getGhostXCursor();
        var targetY = getGhostYCursor();

        if (state === "wander") {
            targetX += randomRange(-200, 200);
            targetY += randomRange(-140, 140);
            setSpeech("..");
        } else if (state === "steal") {
            lastCursorStealAt = now;
            setSpeech("mine");
            targetX = x + Math.cos(now / 220) * 70 + randomRange(-8, 8);
            targetY = y + Math.sin(now / 180) * 50 + randomRange(-8, 8);
        } else {
            setSpeech("");
        }

        var dx = targetX - x;
        var dy = targetY - y;
        vx += dx * 0.0044;
        vy += dy * 0.0044;
        vx *= 0.91;
        vy *= 0.91;
    }

    function clampToViewport() {
        var maxX = Math.max(0, window.innerWidth - 75);
        var maxY = Math.max(0, window.innerHeight - 45);

        if (x < 0) {
            x = 0;
            vx *= -0.4;
        } else if (x > maxX) {
            x = maxX;
            vx *= -0.4;
        }

        if (y < 0) {
            y = 0;
            vy *= -0.4;
        } else if (y > maxY) {
            y = maxY;
            vy *= -0.4;
        }
    }

    function updateCursorHijack() {
        if (state === "steal") {
            var noseX = x + 62;
            var noseY = y + 18;
            setGhostCursorPosition(noseX, noseY);
        } else {
            releaseGhostCursor();
        }
    }

    function frame(now) {
        if (!isRunning) {
            return;
        }
        if (!lastFrame) {
            lastFrame = now;
        }
        var dt = Math.min(40, now - lastFrame) / 16.6;
        lastFrame = now;

        chooseState(now);
        updateVelocity(now);

        x += vx * dt;
        y += vy * dt;
        clampToViewport();

        updateCursorHijack();
        annoyDesktop(now);
        spawnFootstep(now);

        var angle = Math.atan2(vy, vx || 0.01);
        updatePose(angle);
        body.style.left = x + "px";
        body.style.top = y + "px";

        requestAnimationFrame(frame);
    }

    function start() {
        if (!ensureDom()) {
            return;
        }
        body.style.display = "block";

        if (!isRunning) {
            isRunning = true;
            x = Math.max(0, window.innerWidth * 0.15);
            y = Math.max(0, window.innerHeight * 0.55);
            setSpeech("honk");
            requestAnimationFrame(frame);
        }
    }

    return {
        start: start
    };
})();

function showGoose() {
    GooseVirus.start();
}






