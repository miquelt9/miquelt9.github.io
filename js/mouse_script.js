var prevX = window.innerWidth / 2;
var prevY = window.innerHeight / 2;
var ghostX = prevX;
var ghostY = prevY;
var mouseOutisde = false;
var ghostMouse = false;
var ghostMode = "free";
var ghostTargetX = prevX;
var ghostTargetY = prevY;
var mouseNoiseToken = null;
var lastControlledAt = 0;
var controlledOriginX = prevX;
var controlledOriginY = prevY;
var controlledMaxDistanceSq = 0;
var CONTROLLED_RELEASE_DISTANCE = 110;

// Shake-to-locate cursor: grows when the mouse moves fast within a small area,
// just like macOS. We measure "wasted" movement (total path minus bounding box).
// High wasted movement = bigger cursor; straight lines or large sweeps = no growth.
var shakeTrail = [];         // { x, y, t } samples
var currentScale = 1.0;
var SHAKE_WINDOW_MS = 350;  // look at the last 350 ms of movement
var SPEED_MIN = 300;        // wasted px/s – below this the cursor stays at 1×
var SPEED_MAX = 1500;       // wasted px/s – at this speed the cursor reaches MAX_SCALE
var MAX_SCALE = 3.5;
var MIN_SCALE = 1.0;

function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

function updateShakeDetection(x, y, now) {
    shakeTrail.push({ x: x, y: y, t: now });
    while (shakeTrail.length > 0 && now - shakeTrail[0].t > SHAKE_WINDOW_MS) {
        shakeTrail.shift();
    }
}

function currentSpeedPxPerSec(now) {
    if (shakeTrail.length < 2) return 0;

    var totalDist = 0;
    var minX = shakeTrail[0].x, maxX = shakeTrail[0].x;
    var minY = shakeTrail[0].y, maxY = shakeTrail[0].y;

    for (var i = 1; i < shakeTrail.length; i++) {
        var dx = shakeTrail[i].x - shakeTrail[i - 1].x;
        var dy = shakeTrail[i].y - shakeTrail[i - 1].y;
        totalDist += Math.sqrt(dx * dx + dy * dy);
        
        if (shakeTrail[i].x < minX) minX = shakeTrail[i].x;
        if (shakeTrail[i].x > maxX) maxX = shakeTrail[i].x;
        if (shakeTrail[i].y < minY) minY = shakeTrail[i].y;
        if (shakeTrail[i].y > maxY) maxY = shakeTrail[i].y;
    }

    var boxWidth = maxX - minX;
    var boxHeight = maxY - minY;
    var boxDiagonal = Math.sqrt(boxWidth * boxWidth + boxHeight * boxHeight);

    // "Wasted" distance is total distance minus the bounding box diagonal.
    // High wasted distance means lots of back-and-forth movement.
    // If you move in a straight line, totalDist ≈ boxDiagonal, so wastedDist ≈ 0.
    var wastedDist = totalDist - boxDiagonal;
    if (wastedDist < 0) wastedDist = 0;

    // Enforce "small region": if the bounding box is too large, it's not a shake.
    var MAX_REGION = 350; // pixels
    if (boxDiagonal > MAX_REGION) {
        // Fade out the effect if the region gets too large
        var penalty = Math.max(0, 1 - (boxDiagonal - MAX_REGION) / 150);
        wastedDist *= penalty;
    }

    var elapsed = (now - shakeTrail[0].t) / 1000; // seconds
    return elapsed > 0 ? wastedDist / elapsed : 0;
}

function desiredScale(now) {
    var speed = currentSpeedPxPerSec(now);
    if (speed <= SPEED_MIN) return MIN_SCALE;
    var t = Math.min((speed - SPEED_MIN) / (SPEED_MAX - SPEED_MIN), 1.0);
    return MIN_SCALE + (MAX_SCALE - MIN_SCALE) * t * t;
}

function applyCursorScale(scale) {
    var arrowCursor = document.getElementById("arrow");
    var pointerCursor = document.getElementById("pointer");
    arrowCursor.style.width = (12 * scale) + "px";
    pointerCursor.style.width = (16 * scale) + "px";
}

function updateCursorScale() {
    var now = performance.now();
    var target = desiredScale(now);
    var growing = target > currentScale;
    // Snap toward target; grow a bit faster than shrink
    currentScale += (target - currentScale) * (growing ? 0.25 : 0.18);
    if (Math.abs(target - currentScale) < 0.005) currentScale = target;
    applyCursorScale(currentScale);
    requestAnimationFrame(updateCursorScale);
}

function selectFakeCursor(mouseX, mouseY) {
    var arrowCursor = document.getElementById("arrow");
    var pointerCursor = document.getElementById("pointer");
    var targetElement = document.elementFromPoint(mouseX, mouseY);
    var isClickable = !!(targetElement && targetElement.classList && targetElement.classList.contains("clickable"));

    if (isClickable) {
        arrowCursor.style.visibility = "hidden";
        pointerCursor.style.visibility = "visible";
        return pointerCursor;
    }

    arrowCursor.style.visibility = "visible";
    pointerCursor.style.visibility = "hidden";
    return arrowCursor;
}

function paintCursor(mouseX, mouseY) {
    mouseX = clamp(mouseX, 1, window.innerWidth - 1);
    mouseY = clamp(mouseY, 1, window.innerHeight - 1);
    ghostX = mouseX;
    ghostY = mouseY;

    var arrowCursor = document.getElementById("arrow");
    var pointerCursor = document.getElementById("pointer");
    if (mouseOutisde) {
        pointerCursor.style.visibility = "hidden";
        arrowCursor.style.visibility = "hidden";
        return;
    }

    var fakeCursor = selectFakeCursor(mouseX, mouseY);
    fakeCursor.style.left = mouseX + "px";
    fakeCursor.style.top = mouseY + "px";
}

function beginControlledCursorGrab() {
    controlledOriginX = prevX;
    controlledOriginY = prevY;
    controlledMaxDistanceSq = 0;
}

function setGhostCursorPosition(x, y) {
    if (ghostMode !== "controlled") {
        beginControlledCursorGrab();
    }
    ghostMouse = true;
    ghostMode = "controlled";
    lastControlledAt = performance.now();
    ghostTargetX = clamp(x, 1, window.innerWidth - 1);
    ghostTargetY = clamp(y, 1, window.innerHeight - 1);
    paintCursor(ghostTargetX, ghostTargetY);
}

function releaseGhostCursor() {
    var releaseX = prevX;
    var releaseY = prevY;

    ghostMouse = false;
    ghostMode = "free";
    ghostTargetX = releaseX;
    ghostTargetY = releaseY;
    paintCursor(releaseX, releaseY);
}

function ghostMouseMove() {
    var token = Date.now().toString();
    mouseNoiseToken = token;
    ghostMouse = true;
    ghostMode = "virus";
    var endTime = performance.now() + 9000;

    function wiggle() {
        if (mouseNoiseToken !== token) {
            return;
        }
        if (performance.now() > endTime) {
            releaseGhostCursor();
            return;
        }

        var offsetX = (Math.random() - 0.5) * 90;
        var offsetY = (Math.random() - 0.5) * 90;
        var targetX = prevX + offsetX;
        var targetY = prevY + offsetY;
        paintCursor(targetX, targetY);
        requestAnimationFrame(wiggle);
    }

    wiggle();
}

function getGhostXCursor() { return ghostMouse ? ghostX : prevX; }
function getGhostYCursor() { return ghostMouse ? ghostY : prevY; }

function getRealXCursor() { return prevX; }
function getRealYCursor() { return prevY; }

document.body.addEventListener("mouseleave", function() {
    mouseOutisde = true;
    document.getElementById("pointer").style.visibility = "hidden";
    document.getElementById("arrow").style.visibility = "hidden";
});

document.addEventListener("DOMContentLoaded", function() {
    document.body.style.cursor = "none";
    updateCursorScale();

    document.addEventListener("mousemove", function(e) {
        mouseOutisde = false;
        prevX = e.clientX;
        prevY = e.clientY;

        updateShakeDetection(prevX, prevY, performance.now());

        if (ghostMouse && ghostMode !== "free") {
            if (ghostMode === "controlled") {
                var dxFromOrigin = prevX - controlledOriginX;
                var dyFromOrigin = prevY - controlledOriginY;
                var distanceSq = dxFromOrigin * dxFromOrigin + dyFromOrigin * dyFromOrigin;
                if (distanceSq > controlledMaxDistanceSq) {
                    controlledMaxDistanceSq = distanceSq;
                }
            }
            // Failsafe: if controlled mode is stale, return control to user cursor.
            if (ghostMode === "controlled" && performance.now() - lastControlledAt > 250) {
                releaseGhostCursor();
                paintCursor(prevX, prevY);
                return;
            }
            if (ghostMode === "controlled") {
                paintCursor(ghostTargetX, ghostTargetY);
            }
            return;
        }

        paintCursor(prevX, prevY);
    });
});

