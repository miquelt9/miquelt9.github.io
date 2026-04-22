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

function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
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

    if (ghostMode === "controlled") {
        if (controlledMaxDistanceSq < CONTROLLED_RELEASE_DISTANCE * CONTROLLED_RELEASE_DISTANCE) {
            releaseX = controlledOriginX;
            releaseY = controlledOriginY;
        }
    }

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

document.body.addEventListener("mouseleave", function() {
    mouseOutisde = true;
    document.getElementById("pointer").style.visibility = "hidden";
    document.getElementById("arrow").style.visibility = "hidden";
});

document.addEventListener("DOMContentLoaded", function() {
    document.body.style.cursor = "none";

    document.addEventListener("mousemove", function(e) {
        mouseOutisde = false;
        prevX = e.clientX;
        prevY = e.clientY;

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

