var recordingStatus = "off" // off, recording, replaying
var freshRecording = []
var prevTime = undefined
var prevX = undefined
var prevY = undefined
var ghostX = 0
var ghostY = 0
var offsetX = 0
var offsetY = 0
var userMoveCount = 0

var ghostMouse = false;
var mouseOutisde = false;

function getRandomOne() {return Math.random() < 0.5 ? -1 : 1;}

function getRandomInt(min, max) {return Math.floor(Math.random() * (max - min + 1)) + min;}

const targetOffset = 1;
const duration = 3000; // 2 seconds

function ghostMouseMove() {
    var delay = 0;
    for (let i = 1; i <= 20; i++) {
        delay += getRandomInt(300, 600);
        setTimeout(function() {animate( performance.now(), getRandomOne(), getRandomOne(), 0.2+Math.random(), 0.2+Math.random());}, delay);
    }
}

function animate(startT, randomOneX, randomOneY, randomMultX, randomMultY) {

    const currentTime = performance.now();
    const elapsed = currentTime - startT;
    const t = Math.min(1, elapsed / duration); // Ensure t doesn't exceed 1
    const progress = Math.min(1, elapsed / duration);

    if (progress < 1) {
        ghostMouse = true;
        moveCursor(t, randomOneX, randomOneY, randomMultX, randomMultY);
        requestAnimationFrame(function() { animate(startT, randomOneX, randomOneY, randomMultX, randomMultY); });
    } else {
        ghostMouse = false;
    }
}


function recordingCos(t) { return (1 - Math.cos(2 * Math.PI * t));}

function recordingSin(t) {return Math.sin(2* Math.PI * t);}

function recording(t, randomFun) {return randomFun > 0 ? recordingSin(t) : recordingCos(t);}

function moveCursor(t, randomOneX, randomOneY, randomMultX, randomMultY) {

    offsetX += (recording(t, 1) * randomOneX * randomMultX * targetOffset);
    offsetY += (recording(t, 1) * randomOneY * randomMultY * targetOffset);
    
    paintCursor(prevX, prevY);
}


function paintCursor(mouseX, mouseY) {

    mouseX = mouseX + offsetX;
    mouseY = mouseY + offsetY;

    mouseX = Math.max(1, Math.min(mouseX, window.innerWidth-1));
    mouseY = Math.max(1, Math.min(mouseY, window.innerHeight-1));

    ghostX = mouseX;
    ghostY = mouseY;

    var targetElement = document.elementFromPoint(mouseX, mouseY);
    var cursorStyle = window.getComputedStyle(targetElement).cursor;

    var arrowCursor = document.getElementById("arrow");
    var pointerCursor = document.getElementById("pointer");
    var fakeCursor;

    if (targetElement.classList.contains("clickable")
    ) {
        fakeCursor = pointerCursor;
        arrowCursor.style.visibility = "hidden";
        pointerCursor.style.visibility = "visible";
    }
    else {
        fakeCursor = arrowCursor;
        arrowCursor.style.visibility = "visible";
        pointerCursor.style.visibility = "hidden";
    }
    if (mouseOutisde) {    // Mouse is inside
        pointerCursor.style.visibility = "hidden";
        arrowCursor.style.visibility = "hidden";
    } else {
        fakeCursor.style.left = mouseX + "px";
        fakeCursor.style.top = mouseY + "px";
    }
}

function getGhostXCursor() {return ghostMouse ? ghostX : prevX;}

function getGhostYCursor() {return ghostMouse ? ghostY : prevY;}




document.body.addEventListener('mouseleave', function() {
    mouseOutisde = true;
    const pointer = document.getElementById("pointer");
    const arrow = document.getElementById("arrow");
    pointer.style.visibility = "hidden";
    arrow.style.visibility = "hidden";
});

document.addEventListener("DOMContentLoaded", function () {

    document.body.style.cursor = "none";
  
    document.addEventListener("mousemove", function (e) {
      // Set the position of the follower to the cursor coordinates
        mouseOutisde = false;
        var mouseX = e.clientX;
        var mouseY = e.clientY;

        var targetElement = document.elementFromPoint(e.clientX, e.clientY);
        var cursorStyle = window.getComputedStyle(targetElement).cursor;

        var arrowCursor = document.getElementById("arrow");
        var pointerCursor = document.getElementById("pointer");
        var fakeCursor;
    
        if (targetElement.classList.contains("clickable")
        ) {
            fakeCursor = pointerCursor;
            arrowCursor.style.visibility = "hidden";
            pointerCursor.style.visibility = "visible";
        }
        else {
            fakeCursor = arrowCursor;
            arrowCursor.style.visibility = "visible";
            pointerCursor.style.visibility = "hidden";
        }

        if (!ghostMouse) {
            if (!mouseOutisde) {
                fakeCursor.style.left = mouseX + "px";
                fakeCursor.style.top = mouseY + "px";
            }
        }

        prevX = mouseX;
        prevY = mouseY;
    });
  });

