(function initGoose(globalScope) {
    var shared = globalScope.GooseShared;
    var visuals = globalScope.GooseVisuals;

    if (!shared || !visuals) {
        globalScope.showGoose = function showGoose() {};
        return;
    }

    var root = null;
    var sprite = null;
    var footprintLayer = null;
    var propLayer = null;
    var audioContext = null;

    var isRunning = false;
    var isReady = false;
    var lastFrameAt = 0;
    var lastFrameKey = "";
    var lastHonkAt = 0;
    var stateUntil = 0;
    var currentState = shared.STATE.idle;
    var locomotion = "walk";
    var currentDirection = "E";
    var animationTime = 0;

    var position = { x: 120, y: 240 };
    var velocity = { x: 0, y: 0 };
    var target = { x: 320, y: 240 };
    var pendingFetchEdge = null;
    var fetchElement = null;
    var fetchNoteCaptured = false;
    var draggedWindow = null;
    var draggedWindowGrabPoint = null;
    var draggedWindowDestination = null;
    var pendingUiInteraction = null;

    function getViewportTarget() {
        return {
            x: shared.randomRange(40, window.innerWidth - shared.FRAME_WIDTH - 60),
            y: shared.randomRange(60, window.innerHeight - shared.FRAME_HEIGHT - 80),
        };
    }

    function chooseOffscreenEdge() {
        var edges = [
            { x: -shared.FRAME_WIDTH - 120, y: shared.randomRange(50, window.innerHeight - shared.FRAME_HEIGHT - 40) },
            { x: window.innerWidth + 120, y: shared.randomRange(50, window.innerHeight - shared.FRAME_HEIGHT - 40) },
            { x: shared.randomRange(40, window.innerWidth - shared.FRAME_WIDTH - 40), y: -shared.FRAME_HEIGHT - 90 },
            { x: shared.randomRange(40, window.innerWidth - shared.FRAME_WIDTH - 40), y: window.innerHeight + 100 },
        ];
        return edges[Math.floor(Math.random() * edges.length)];
    }

    function isWindowVisible(element) {
        return !!(element && window.getComputedStyle(element).display !== "none");
    }

    function isElementVisible(element) {
        if (!element) {
            return false;
        }
        var computed = window.getComputedStyle(element);
        var rect = element.getBoundingClientRect();
        return computed.display !== "none" && computed.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    }

    function getElementCenter(element) {
        var rect = element.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        };
    }

    function getDesktopIconTargets() {
        return [
            { iconId: "aboutme", windowId: "aboutbox" },
            { iconId: "projects", windowId: "projectsbox" },
            { iconId: "contactme", windowId: "contactmebox" },
            { iconId: "terminal", windowId: "terminalbox" },
        ];
    }

    function chooseIconOpenInteraction() {
        var targets = getDesktopIconTargets();
        var candidates = [];
        for (var i = 0; i < targets.length; i += 1) {
            var icon = document.getElementById(targets[i].iconId);
            var win = document.getElementById(targets[i].windowId);
            if (!isElementVisible(icon) || isWindowVisible(win)) {
                continue;
            }
            candidates.push({
                point: getElementCenter(icon),
                run: false,
                action: function(windowId) {
                    return function performOpen() {
                        if (typeof globalScope.showWindow === "function") {
                            globalScope.showWindow(windowId);
                        }
                    };
                }(targets[i].windowId),
            });
        }
        if (candidates.length === 0) {
            return null;
        }
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    function getCloseButtonForWindow(windowId) {
        var header = document.getElementById(windowId + "header");
        if (!header) {
            return null;
        }
        var buttons = header.querySelectorAll(".topbarButton, .terminaltopbarButton");
        for (var i = 0; i < buttons.length; i += 1) {
            if (buttons[i].textContent.trim() === "X") {
                return buttons[i];
            }
        }
        return null;
    }

    function chooseWindowCloseInteraction() {
        var windowIds = ["aboutbox", "projectsbox", "contactmebox", "terminalbox"];
        var candidates = [];
        for (var i = 0; i < windowIds.length; i += 1) {
            var win = document.getElementById(windowIds[i]);
            if (!isWindowVisible(win)) {
                continue;
            }
            var closeButton = getCloseButtonForWindow(windowIds[i]);
            if (!isElementVisible(closeButton)) {
                continue;
            }
            candidates.push({
                point: getElementCenter(closeButton),
                run: true,
                action: function(windowId) {
                    return function performClose() {
                        if (typeof globalScope.hideWindow === "function") {
                            globalScope.hideWindow(windowId);
                        }
                    };
                }(windowIds[i]),
            });
        }
        if (candidates.length === 0) {
            return null;
        }
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    function chooseUiInteraction() {
        var openInteraction = chooseIconOpenInteraction();
        var closeInteraction = chooseWindowCloseInteraction();
        if (openInteraction && closeInteraction) {
            return Math.random() < 0.55 ? openInteraction : closeInteraction;
        }
        return openInteraction || closeInteraction;
    }

    function getWindowDragCandidates() {
        var ids = ["terminalbox", "aboutbox", "contactmebox", "projectsbox"];
        var candidates = [];
        for (var i = 0; i < ids.length; i += 1) {
            var element = document.getElementById(ids[i]);
            if (!isWindowVisible(element)) {
                continue;
            }
            if (element.dataset && element.dataset.isMaximized === "true") {
                continue;
            }
            candidates.push(element);
        }
        return candidates;
    }

    function chooseWindowDragTarget() {
        var candidates = getWindowDragCandidates();
        if (candidates.length === 0) {
            return null;
        }
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    function getWindowGrabPoint(element) {
        var rect = element.getBoundingClientRect();
        return {
            x: rect.left + Math.min(rect.width * 0.22, 64),
            y: rect.top + 16,
        };
    }

    function getWindowDropTarget(element) {
        var taskbar = document.getElementById("taskbar");
        var taskbarHeight = taskbar ? taskbar.offsetHeight : 0;
        return {
            x: shared.randomRange(18, Math.max(18, window.innerWidth - element.offsetWidth - 18)),
            y: shared.randomRange(18, Math.max(18, window.innerHeight - taskbarHeight - element.offsetHeight - 18)),
        };
    }

    function ensureDom() {
        if (isReady) {
            return true;
        }

        root = document.getElementById("goose1");
        if (!root) {
            root = document.createElement("div");
            root.id = "goose1";
            document.body.appendChild(root);
        }

        root.className = "goose-pet goose-root";
        root.innerHTML = '<div class="goose-pet-sprite" aria-hidden="true"></div>';
        root.setAttribute("aria-hidden", "true");

        sprite = root.firstElementChild;
        sprite.style.backgroundImage = 'url("' + visuals.buildSpriteSheet() + '")';
        sprite.style.backgroundSize = (shared.SHEET_FRAME_WIDTH * shared.TOTAL_COLUMNS) + "px " + (shared.SHEET_FRAME_HEIGHT * shared.SPRITE_ROWS.length) + "px";

        footprintLayer = document.createElement("div");
        footprintLayer.className = "goose-trail-container";
        document.body.appendChild(footprintLayer);

        propLayer = document.createElement("div");
        propLayer.className = "goose-gifts-container";
        document.body.appendChild(propLayer);

        root.addEventListener("mousedown", function onGooseClick(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            setState(shared.STATE.chase, performance.now(), 2200 + shared.randomRange(0, 1200));
            playHonk(720);
        });

        isReady = true;
        return true;
    }

    function playHonk(frequency) {
        try {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            var now = audioContext.currentTime;
            var oscillator = audioContext.createOscillator();
            var gain = audioContext.createGain();
            oscillator.type = "square";
            oscillator.frequency.setValueAtTime(frequency || 620, now);
            oscillator.frequency.exponentialRampToValueAtTime((frequency || 620) * 1.35, now + 0.04);
            oscillator.frequency.exponentialRampToValueAtTime((frequency || 620) * 0.72, now + 0.16);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.exponentialRampToValueAtTime(0.06, now + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
            oscillator.connect(gain);
            gain.connect(audioContext.destination);
            oscillator.start(now);
            oscillator.stop(now + 0.23);
            lastHonkAt = performance.now();
        } catch (error) {
            // Audio is optional if blocked by the browser.
        }
    }

    function setState(nextState, now, duration) {
        currentState = nextState;
        stateUntil = now + (duration || 0);
        if (nextState !== shared.STATE.uiInteract) {
            pendingUiInteraction = null;
        }

        if (nextState === shared.STATE.idle) {
            locomotion = "walk";
            velocity.x *= 0.55;
            velocity.y *= 0.55;
            if (now - lastHonkAt > 1800 && Math.random() < 0.38) {
                playHonk(540 + shared.randomRange(0, 80));
            }
        } else if (nextState === shared.STATE.wander) {
            locomotion = Math.random() < 0.68 ? "walk" : "run";
            target = getViewportTarget();
        } else if (nextState === shared.STATE.fetchExit) {
            locomotion = "walk";
            pendingFetchEdge = chooseOffscreenEdge();
            target = { x: pendingFetchEdge.x, y: pendingFetchEdge.y };
            fetchNoteCaptured = false;
        } else if (nextState === shared.STATE.fetchWait) {
            locomotion = "idle";
        } else if (nextState === shared.STATE.fetchReturn) {
            locomotion = "walk";
            target = getViewportTarget();
        } else if (nextState === shared.STATE.chase || nextState === shared.STATE.cursorDrag) {
            locomotion = "run";
            if (nextState === shared.STATE.cursorDrag) {
                target = chooseOffscreenEdge();
                playHonk(860);
            }
        } else if (nextState === shared.STATE.windowDrag) {
            draggedWindow = chooseWindowDragTarget();
            draggedWindowGrabPoint = null;
            draggedWindowDestination = null;
            if (!draggedWindow) {
                currentState = shared.STATE.wander;
                locomotion = "walk";
                target = getViewportTarget();
                return;
            }
            locomotion = "walk";
            draggedWindowGrabPoint = getWindowGrabPoint(draggedWindow);
            target = {
                x: draggedWindowGrabPoint.x - shared.FRAME_WIDTH * 0.52,
                y: draggedWindowGrabPoint.y - shared.FRAME_HEIGHT * 0.46,
            };
            if (globalScope.WindowManager && typeof globalScope.WindowManager.bringToFront === "function") {
                globalScope.WindowManager.bringToFront(draggedWindow.id);
            }
            playHonk(610);
        } else if (nextState === shared.STATE.uiInteract) {
            pendingUiInteraction = chooseUiInteraction();
            if (!pendingUiInteraction) {
                currentState = shared.STATE.wander;
                locomotion = "walk";
                target = getViewportTarget();
                return;
            }
            locomotion = pendingUiInteraction.run ? "run" : "walk";
            target = {
                x: pendingUiInteraction.point.x - shared.FRAME_WIDTH * 0.52,
                y: pendingUiInteraction.point.y - shared.FRAME_HEIGHT * 0.46,
            };
            playHonk(pendingUiInteraction.run ? 760 : 660);
        }
    }

    function getDirectionFromVector(x, y) {
        if (Math.abs(x) < 0.001 && Math.abs(y) < 0.001) {
            return currentDirection;
        }
        var angle = Math.atan2(y, x);
        var octant = Math.round(angle / (Math.PI / 4)) % 8;
        if (octant < 0) {
            octant += 8;
        }
        return shared.SPRITE_ROWS[octant];
    }

    function getAnimState() {
        if (currentState === shared.STATE.idle || (Math.abs(velocity.x) + Math.abs(velocity.y) < 10 && currentState !== shared.STATE.cursorDrag)) {
            return "idle";
        }
        return locomotion === "run" ? "run" : "walk";
    }

    function getFrameColumn(animState, frame) {
        return shared.STATE_COLUMNS[animState].offset + frame;
    }

    function getBeakWorldPosition() {
        var pose = visuals.getDirectionPose(currentDirection);
        return {
            x: position.x + shared.FRAME_WIDTH * 0.44 + pose.vx * 35,
            y: position.y + shared.FRAME_HEIGHT * 0.48 + pose.vy * 31,
        };
    }

    function getFootWorldPosition(sideSign) {
        var directionVector = shared.normalize(velocity.x || (target.x - position.x), velocity.y || (target.y - position.y));
        var right = { x: directionVector.y, y: -directionVector.x };
        var center = {
            x: position.x + shared.FRAME_WIDTH * 0.43,
            y: position.y + shared.FRAME_HEIGHT * 0.74,
        };
        return {
            x: center.x - directionVector.x * 8 + right.x * sideSign * 8,
            y: center.y - directionVector.y * 8 + right.y * sideSign * 8,
        };
    }

    function leaveFootprint(sideSign) {
        if (!footprintLayer) {
            return;
        }
        var point = getFootWorldPosition(sideSign);
        var footprint = document.createElement("div");
        footprint.className = "goose-footstep";
        footprint.style.left = point.x + "px";
        footprint.style.top = point.y + "px";
        footprint.style.transform = "rotate(" + shared.randomRange(-18, 18) + "deg)";
        footprintLayer.appendChild(footprint);
        setTimeout(function cleanupFootprint() {
            footprint.remove();
        }, 2600);
    }

    function updateSprite(dt) {
        var animState = getAnimState();
        animationTime += dt * shared.STATE_COLUMNS[animState].fps;
        var frame = Math.floor(animationTime) % shared.STATE_COLUMNS[animState].frames;
        var row = shared.SPRITE_ROWS.indexOf(currentDirection);
        var column = getFrameColumn(animState, frame);
        sprite.style.backgroundPosition =
            (-(column * shared.SHEET_FRAME_WIDTH + shared.FRAME_PADDING_X)) + "px " +
            (-(row * shared.SHEET_FRAME_HEIGHT + shared.FRAME_PADDING_Y)) + "px";

        var frameKey = animState + ":" + frame + ":" + currentDirection;
        if (frameKey !== lastFrameKey) {
            lastFrameKey = frameKey;
            if (shared.FOOT_CONTACT[animState] && Object.prototype.hasOwnProperty.call(shared.FOOT_CONTACT[animState], frame)) {
                leaveFootprint(shared.FOOT_CONTACT[animState][frame]);
            }
        }
    }

    function isOffscreen(margin) {
        var extra = margin || 0;
        return (
            position.x < -shared.FRAME_WIDTH - extra ||
            position.y < -shared.FRAME_HEIGHT - extra ||
            position.x > window.innerWidth + extra ||
            position.y > window.innerHeight + extra
        );
    }

    function updateFetchElement() {
        if (!fetchElement) {
            return;
        }
        var beak = getBeakWorldPosition();
        var directionVector = shared.normalize(velocity.x || 1, velocity.y || 0);
        var right = { x: directionVector.y, y: -directionVector.x };
        var dragX = beak.x - directionVector.x * 62 + right.x * 12;
        var dragY = beak.y - directionVector.y * 62 + right.y * 12;
        fetchElement.style.transform = "translate3d(" + dragX + "px, " + dragY + "px, 0)";
    }

    function updateDraggedWindow() {
        if (!draggedWindow || !draggedWindowGrabPoint || !isWindowVisible(draggedWindow)) {
            return;
        }
        var beak = getBeakWorldPosition();
        draggedWindow.style.left = (beak.x - draggedWindowGrabPoint.x) + "px";
        draggedWindow.style.top = (beak.y - draggedWindowGrabPoint.y) + "px";
    }

    function releaseDraggedWindow() {
        draggedWindow = null;
        draggedWindowGrabPoint = null;
        draggedWindowDestination = null;
    }

    function releaseFetchElement() {
        if (!fetchElement) {
            return;
        }
        var releasedElement = fetchElement;
        releasedElement.classList.add("goose-fetch-item-dropped");
        setTimeout(function cleanupFetchItem() {
            releasedElement.remove();
        }, 16000);
        fetchElement = null;
    }

    function maybeStartCursorGrab(now) {
        if (currentState !== shared.STATE.chase) {
            return;
        }
        var beak = getBeakWorldPosition();
        var cursorX = typeof getGhostXCursor === "function" ? getGhostXCursor() : beak.x;
        var cursorY = typeof getGhostYCursor === "function" ? getGhostYCursor() : beak.y;
        if (shared.distance(beak.x, beak.y, cursorX, cursorY) < 24) {
            setState(shared.STATE.cursorDrag, now, 1800);
        }
    }

    function updateState(now) {
        if (currentState === shared.STATE.idle) {
            if (now >= stateUntil) {
                var roll = Math.random();
                if (roll < 0.34) {
                    setState(shared.STATE.fetchExit, now);
                } else if (roll < 0.46) {
                    setState(shared.STATE.windowDrag, now, 2600 + shared.randomRange(0, 1800));
                } else if (roll < 0.60) {
                    setState(shared.STATE.uiInteract, now, 1200 + shared.randomRange(0, 900));
                } else if (roll < 0.80) {
                    setState(shared.STATE.chase, now, 2200 + shared.randomRange(0, 1400));
                } else {
                    setState(shared.STATE.wander, now, 1800 + shared.randomRange(0, 1800));
                }
            }
            return;
        }

        if (currentState === shared.STATE.wander && shared.distance(position.x, position.y, target.x, target.y) < 18) {
            setState(shared.STATE.idle, now, 700 + shared.randomRange(0, 900));
            return;
        }

        if (currentState === shared.STATE.fetchExit) {
            if (isOffscreen(40)) {
                setState(shared.STATE.fetchWait, now, 350);
                if (!fetchNoteCaptured) {
                    fetchElement = visuals.buildFetchElement(propLayer);
                    fetchNoteCaptured = true;
                }
            }
            return;
        }

        if (currentState === shared.STATE.fetchWait && now >= stateUntil) {
            setState(shared.STATE.fetchReturn, now, 2400 + shared.randomRange(0, 1400));
            return;
        }

        if (currentState === shared.STATE.fetchReturn && shared.distance(position.x, position.y, target.x, target.y) < 18) {
            releaseFetchElement();
            setState(shared.STATE.idle, now, 900 + shared.randomRange(0, 800));
            return;
        }

        if (currentState === shared.STATE.windowDrag) {
            if (!draggedWindow || !isWindowVisible(draggedWindow)) {
                releaseDraggedWindow();
                setState(shared.STATE.wander, now, 1500 + shared.randomRange(0, 1200));
                return;
            }

            if (!draggedWindowDestination) {
                var windowBeakDistance = shared.distance(position.x + shared.FRAME_WIDTH * 0.52, position.y + shared.FRAME_HEIGHT * 0.46, draggedWindowGrabPoint.x, draggedWindowGrabPoint.y);
                if (windowBeakDistance < 26) {
                    draggedWindowDestination = getWindowDropTarget(draggedWindow);
                    target = {
                        x: draggedWindowDestination.x,
                        y: draggedWindowDestination.y,
                    };
                    locomotion = "run";
                    playHonk(690);
                }
                return;
            }

            if (shared.distance(position.x, position.y, draggedWindowDestination.x, draggedWindowDestination.y) < 22 || now >= stateUntil) {
                updateDraggedWindow();
                releaseDraggedWindow();
                setState(shared.STATE.idle, now, 700 + shared.randomRange(0, 700));
                return;
            }
        }

        if (currentState === shared.STATE.uiInteract) {
            if (!pendingUiInteraction) {
                setState(shared.STATE.wander, now, 1200 + shared.randomRange(0, 1200));
                return;
            }

            if (shared.distance(position.x, position.y, target.x, target.y) < 20 || now >= stateUntil) {
                pendingUiInteraction.action();
                pendingUiInteraction = null;
                setState(shared.STATE.idle, now, 700 + shared.randomRange(0, 700));
                return;
            }
        }

        if (currentState === shared.STATE.chase) {
            target.x = typeof getGhostXCursor === "function" ? getGhostXCursor() - shared.FRAME_WIDTH * 0.35 : target.x;
            target.y = typeof getGhostYCursor === "function" ? getGhostYCursor() - shared.FRAME_HEIGHT * 0.5 : target.y;
            maybeStartCursorGrab(now);
            if (now >= stateUntil) {
                setState(shared.STATE.wander, now, 1600 + shared.randomRange(0, 1600));
            }
            return;
        }

        if (currentState === shared.STATE.cursorDrag) {
            var beak = getBeakWorldPosition();
            if (typeof setGhostCursorPosition === "function") {
                setGhostCursorPosition(beak.x, beak.y);
            }
            if (now >= stateUntil || isOffscreen(30)) {
                if (typeof releaseGhostCursor === "function") {
                    releaseGhostCursor();
                }
                setState(shared.STATE.wander, now, 1400 + shared.randomRange(0, 1600));
            }
        }
    }

    function updateMotion(dt) {
        var desiredSpeed = 0;
        if (currentState === shared.STATE.wander || currentState === shared.STATE.fetchExit || currentState === shared.STATE.fetchReturn) {
            desiredSpeed = locomotion === "run" ? 180 : 95;
        } else if (currentState === shared.STATE.chase || currentState === shared.STATE.cursorDrag) {
            desiredSpeed = 185;
        } else if (currentState === shared.STATE.uiInteract) {
            desiredSpeed = locomotion === "run" ? 185 : 95;
        }

        var dx = target.x - position.x;
        var dy = target.y - position.y;
        var directionVector = shared.normalize(dx, dy);
        var desiredVelocityX = directionVector.x * desiredSpeed;
        var desiredVelocityY = directionVector.y * desiredSpeed;

        if (currentState === shared.STATE.idle || currentState === shared.STATE.fetchWait) {
            desiredVelocityX = 0;
            desiredVelocityY = 0;
        }

        var blend = shared.clamp(dt * 7.5, 0.08, 0.5);
        velocity.x += (desiredVelocityX - velocity.x) * blend;
        velocity.y += (desiredVelocityY - velocity.y) * blend;
        velocity.x *= 0.94;
        velocity.y *= 0.94;

        position.x += velocity.x * dt;
        position.y += velocity.y * dt;

        if (currentState !== shared.STATE.fetchExit && currentState !== shared.STATE.fetchWait && currentState !== shared.STATE.cursorDrag) {
            position.x = shared.clamp(position.x, -30, window.innerWidth - shared.FRAME_WIDTH + 20);
            position.y = shared.clamp(position.y, 10, window.innerHeight - shared.FRAME_HEIGHT - 12);
        }

        currentDirection = getDirectionFromVector(velocity.x, velocity.y);
    }

    function render(dt) {
        root.style.transform = "translate3d(" + position.x + "px, " + position.y + "px, 0)";
        updateSprite(dt);
        updateFetchElement();
        updateDraggedWindow();
    }

    function frame(now) {
        if (!isRunning) {
            return;
        }

        if (!lastFrameAt) {
            lastFrameAt = now;
        }
        var dt = Math.min(0.05, (now - lastFrameAt) / 1000);
        lastFrameAt = now;

        updateState(now);
        updateMotion(dt);
        render(dt);
        requestAnimationFrame(frame);
    }

    function start() {
        if (!ensureDom()) {
            return;
        }

        root.style.display = "block";
        if (isRunning) {
            setState(shared.STATE.chase, performance.now(), 2200);
            return;
        }

        position.x = Math.max(40, window.innerWidth * 0.12);
        position.y = Math.max(80, window.innerHeight * 0.46);
        target = getViewportTarget();
        setState(shared.STATE.wander, performance.now(), 1800);
        isRunning = true;
        requestAnimationFrame(frame);
    }

    globalScope.GooseVirus = {
        start: start,
    };

    globalScope.showGoose = function showGoose() {
        globalScope.GooseVirus.start();
    };
})(window);