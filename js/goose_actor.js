(function initGooseActor(globalScope) {
    var shared = globalScope.GooseShared;
    var visuals = globalScope.GooseVisuals;

    if (!shared || !visuals) {
        return;
    }

    function createActor(gooseId, env) {
        var dom = env.createRoot(gooseId);
        var goose = {
            id: gooseId,
            root: dom.root,
            sprite: dom.sprite,
            lastHonkAt: 0,
            stateStartedAt: 0,
            stateUntil: 0,
            currentState: shared.STATE.idle,
            locomotion: "walk",
            currentDirection: "E",
            animationTime: 0,
            lastFrameKey: "",
            position: { x: 120, y: 240 },
            velocity: { x: 0, y: 0 },
            target: { x: 320, y: 240 },
            pendingFetchEdge: null,
            fetchElement: null,
            fetchNoteCaptured: false,
            draggedWindow: null,
            draggedWindowGrabPoint: null,
            draggedWindowGrabOffset: null,
            draggedWindowDestination: null,
            pendingUiInteraction: null,
            updateFrame: updateFrame,
        };

        goose.root.addEventListener("mousedown", function onGooseClick(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            startChase(performance.now(), 3200, 1600);
            env.playHonk(goose);
        });

        spawnFromEdge();
        return goose;

        function setState(nextState, now, duration) {
            goose.currentState = nextState;
            goose.stateStartedAt = now;
            goose.stateUntil = now + (duration || 0);
            if (nextState !== shared.STATE.uiInteract) {
                goose.pendingUiInteraction = null;
            }

            if (nextState === shared.STATE.idle) {
                goose.locomotion = "walk";
                goose.velocity.x *= 0.55;
                goose.velocity.y *= 0.55;
                if (now - goose.lastHonkAt > 1800 && Math.random() < 0.38) {
                    env.playHonk(goose);
                }
            } else if (nextState === shared.STATE.wander) {
                goose.locomotion = Math.random() < 0.68 ? "walk" : "run";
                goose.target = env.getViewportTarget();
            } else if (nextState === shared.STATE.fetchExit) {
                goose.locomotion = "walk";
                goose.pendingFetchEdge = env.chooseOffscreenEdge();
                goose.target = { x: goose.pendingFetchEdge.x, y: goose.pendingFetchEdge.y };
                goose.fetchNoteCaptured = false;
            } else if (nextState === shared.STATE.fetchWait) {
                goose.locomotion = "idle";
            } else if (nextState === shared.STATE.fetchReturn) {
                goose.locomotion = "walk";
                goose.target = env.getViewportTarget();
            } else if (nextState === shared.STATE.chase || nextState === shared.STATE.cursorDrag) {
                goose.locomotion = "run";
                if (nextState === shared.STATE.cursorDrag) {
                    goose.target = env.chooseOffscreenEdge();
                    env.playHonk(goose);
                }
            } else if (nextState === shared.STATE.windowDrag) {
                goose.draggedWindow = env.chooseWindowDragTarget(goose);
                goose.draggedWindowGrabPoint = null;
                goose.draggedWindowGrabOffset = null;
                goose.draggedWindowDestination = null;
                if (!goose.draggedWindow) {
                    goose.currentState = shared.STATE.wander;
                    goose.locomotion = "walk";
                    goose.target = env.getViewportTarget();
                    return;
                }
                goose.locomotion = "walk";
                goose.draggedWindowGrabPoint = env.getWindowGrabPoint(goose.draggedWindow);
                goose.draggedWindowGrabOffset = env.getWindowGrabOffset(goose.draggedWindow, goose.draggedWindowGrabPoint);
                goose.target = getGooseTargetForBeakTarget(goose.draggedWindowGrabPoint);
                if (globalScope.WindowManager && typeof globalScope.WindowManager.bringToFront === "function") {
                    globalScope.WindowManager.bringToFront(goose.draggedWindow.id);
                }
                env.playHonk(goose);
            } else if (nextState === shared.STATE.uiInteract) {
                goose.pendingUiInteraction = env.chooseUiInteraction();
                if (!goose.pendingUiInteraction) {
                    goose.currentState = shared.STATE.wander;
                    goose.locomotion = "walk";
                    goose.target = env.getViewportTarget();
                    return;
                }
                goose.locomotion = goose.pendingUiInteraction.run ? "run" : "walk";
                goose.target = getGooseTargetForBeakTarget(goose.pendingUiInteraction.point);
            }
        }

        function startChase(now, baseDuration, durationVariance) {
            setState(shared.STATE.chase, now, baseDuration + shared.randomRange(0, durationVariance || 0));
        }

        function getChaseStage(now) {
            var elapsed;
            var totalDuration;
            var progress;
            if (goose.currentState !== shared.STATE.chase) {
                return 0;
            }
            elapsed = Math.max(0, now - goose.stateStartedAt);
            totalDuration = Math.max(1, goose.stateUntil - goose.stateStartedAt);
            progress = shared.clamp(elapsed / totalDuration, 0, 1);
            if (progress < 0.16) {
                return 0;
            }
            if (progress < 0.36) {
                return 1;
            }
            if (progress < 0.6) {
                return 2;
            }
            return 3;
        }

        function getChaseSpeed(now) {
            return [220, 265, 325, 390][getChaseStage(now)];
        }

        function getChaseGrabDistance(now) {
            return [28, 36, 44, 56][getChaseStage(now)];
        }

        function getDirectionFromVector(x, y) {
            if (Math.abs(x) < 0.001 && Math.abs(y) < 0.001) {
                return goose.currentDirection;
            }
            var angle = Math.atan2(y, x);
            var octant = Math.round(angle / (Math.PI / 4)) % 8;
            if (octant < 0) {
                octant += 8;
            }
            return shared.SPRITE_ROWS[octant];
        }

        function getAnimState() {
            if (goose.currentState === shared.STATE.idle || (Math.abs(goose.velocity.x) + Math.abs(goose.velocity.y) < 10 && goose.currentState !== shared.STATE.cursorDrag)) {
                return "idle";
            }
            return goose.locomotion === "run" ? "run" : "walk";
        }

        function getFrameColumn(animState, frame) {
            return shared.STATE_COLUMNS[animState].offset + frame;
        }

        function getBeakWorldPosition() {
            var pose = visuals.getDirectionPose(goose.currentDirection);
            return {
                x: goose.position.x + shared.FRAME_WIDTH * 0.44 + pose.vx * 35,
                y: goose.position.y + shared.FRAME_HEIGHT * 0.48 + pose.vy * 31,
            };
        }

        function getBeakOffsetForDirection(direction) {
            var pose = visuals.getDirectionPose(direction);
            return {
                x: shared.FRAME_WIDTH * 0.44 + pose.vx * 35,
                y: shared.FRAME_HEIGHT * 0.48 + pose.vy * 31,
            };
        }

        function getGooseTargetForBeakTarget(beakTarget) {
            var direction = getDirectionFromVector(beakTarget.x - goose.position.x, beakTarget.y - goose.position.y);
            var offset = getBeakOffsetForDirection(direction);
            return {
                x: beakTarget.x - offset.x,
                y: beakTarget.y - offset.y,
            };
        }

        function getFootWorldPosition(sideSign) {
            // Visual center of feet in unrotated local space
            var unrotatedX = sideSign === -1 ? 1.25 : 11.25;
            var unrotatedY = sideSign === -1 ? 19.5 : 20.5;
            
            var pose = window.GooseVisuals.getDirectionPose(goose.currentDirection);
            var rad = pose.angle * Math.PI / 180;
            var cos = Math.cos(rad);
            var sin = Math.sin(rad);
            
            var rotX = unrotatedX * cos - unrotatedY * sin;
            var rotY = unrotatedX * sin + unrotatedY * cos;

            return {
                x: goose.position.x + shared.FRAME_WIDTH * 0.5 + rotX,
                y: goose.position.y + shared.FRAME_HEIGHT * 0.5 + rotY,
            };
        }

        function leaveFootprint(sideSign) {
            var footprintLayer = env.getFootprintLayer();
            if (!footprintLayer) {
                return;
            }
            var point = getFootWorldPosition(sideSign);
            var pose = window.GooseVisuals.getDirectionPose(goose.currentDirection);
            var footprint = document.createElement("div");
            footprint.className = "goose-footstep";
            footprint.style.left = (point.x - 3.5) + "px";
            footprint.style.top = (point.y - 3.5) + "px";
            footprint.style.transform = "rotate(" + (pose.angle + shared.randomRange(-18, 18)) + "deg)";
            footprintLayer.appendChild(footprint);
            setTimeout(function cleanupFootprint() {
                footprint.remove();
            }, 2600);
        }

        function updateSprite(dt) {
            var animState = getAnimState();
            goose.animationTime += dt * shared.STATE_COLUMNS[animState].fps;
            var frame = Math.floor(goose.animationTime) % shared.STATE_COLUMNS[animState].frames;
            var row = shared.SPRITE_ROWS.indexOf(goose.currentDirection);
            var column = getFrameColumn(animState, frame);
            goose.sprite.style.backgroundPosition =
                (-(column * shared.SHEET_FRAME_WIDTH)) + "px " +
                (-(row * shared.SHEET_FRAME_HEIGHT)) + "px";

            var frameKey = animState + ":" + frame + ":" + goose.currentDirection;
            if (frameKey !== goose.lastFrameKey) {
                goose.lastFrameKey = frameKey;
                if (shared.FOOT_CONTACT[animState] && Object.prototype.hasOwnProperty.call(shared.FOOT_CONTACT[animState], frame)) {
                    leaveFootprint(shared.FOOT_CONTACT[animState][frame]);
                }
            }
        }

        function isOffscreen(margin) {
            var extra = margin || 0;
            return (
                goose.position.x < -shared.FRAME_WIDTH - extra ||
                goose.position.y < -shared.FRAME_HEIGHT - extra ||
                goose.position.x > window.innerWidth + extra ||
                goose.position.y > window.innerHeight + extra
            );
        }

        function updateFetchElement() {
            if (!goose.fetchElement) {
                return;
            }
            var beak = getBeakWorldPosition();
            var directionVector = shared.normalize(goose.velocity.x || 1, goose.velocity.y || 0);
            var right = { x: directionVector.y, y: -directionVector.x };
            var dragX = beak.x - directionVector.x * 62 + right.x * 12;
            var dragY = beak.y - directionVector.y * 62 + right.y * 12;
            goose.fetchElement.style.transform = "translate3d(" + dragX + "px, " + dragY + "px, 0)";
        }

        function updateDraggedWindow() {
            if (!goose.draggedWindow || !goose.draggedWindowGrabOffset || !env.isWindowVisible(goose.draggedWindow)) {
                return;
            }
            var beak = getBeakWorldPosition();
            goose.draggedWindow.style.left = (beak.x - goose.draggedWindowGrabOffset.x) + "px";
            goose.draggedWindow.style.top = (beak.y - goose.draggedWindowGrabOffset.y) + "px";
        }

        function releaseDraggedWindow() {
            if (goose.draggedWindow && goose.draggedWindowDestination && env.isWindowVisible(goose.draggedWindow)) {
                goose.draggedWindow.style.left = goose.draggedWindowDestination.x + "px";
                goose.draggedWindow.style.top = goose.draggedWindowDestination.y + "px";
            }
            goose.draggedWindow = null;
            goose.draggedWindowGrabPoint = null;
            goose.draggedWindowGrabOffset = null;
            goose.draggedWindowDestination = null;
        }

        function releaseFetchElement() {
            if (!goose.fetchElement) {
                return;
            }
            var releasedElement = goose.fetchElement;
            releasedElement.classList.add("goose-fetch-item-dropped");
            goose.fetchElement = null;
        }

        function bindFetchElementControls(fetchElement) {
            if (!fetchElement) {
                return;
            }
            var closeButton = fetchElement.querySelector(".goose-fetch-window-close");
            if (!closeButton) {
                return;
            }
            closeButton.addEventListener("click", function onFetchElementClose(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                var wasCarried = goose.fetchElement === fetchElement && goose.currentState === shared.STATE.fetchReturn;
                if (goose.fetchElement === fetchElement) {
                    goose.fetchElement = null;
                }
                fetchElement.remove();
                if (wasCarried) {
                    startChase(performance.now(), 4200, 1800);
                }
            });
        }

        function maybeStartCursorGrab(now) {
            if (goose.currentState !== shared.STATE.chase) {
                return;
            }
            var beak = getBeakWorldPosition();
            var cursorX = typeof getGhostXCursor === "function" ? getGhostXCursor() : beak.x;
            var cursorY = typeof getGhostYCursor === "function" ? getGhostYCursor() : beak.y;
            if (shared.distance(beak.x, beak.y, cursorX, cursorY) < getChaseGrabDistance(now)) {
                setState(shared.STATE.cursorDrag, now, 1800);
            }
        }

        function updateState(now) {
            if (goose.currentState === shared.STATE.idle) {
                if (now >= goose.stateUntil) {
                    var roll = Math.random();
                    if (roll < 0.34) {
                        setState(shared.STATE.fetchExit, now);
                    } else if (roll < 0.46) {
                        setState(shared.STATE.windowDrag, now, 2600 + shared.randomRange(0, 1800));
                    } else if (roll < 0.60) {
                        setState(shared.STATE.uiInteract, now, 2600 + shared.randomRange(0, 1400));
                    } else if (roll < 0.80) {
                        startChase(now, 3400, 2000);
                    } else {
                        setState(shared.STATE.wander, now, 1800 + shared.randomRange(0, 1800));
                    }
                }
                return;
            }

            if (goose.currentState === shared.STATE.wander && shared.distance(goose.position.x, goose.position.y, goose.target.x, goose.target.y) < 18) {
                setState(shared.STATE.idle, now, 700 + shared.randomRange(0, 900));
                return;
            }

            if (goose.currentState === shared.STATE.fetchExit) {
                if (isOffscreen(40)) {
                    setState(shared.STATE.fetchWait, now, 350);
                    if (!goose.fetchNoteCaptured) {
                        goose.fetchElement = env.buildFetchElement();
                        bindFetchElementControls(goose.fetchElement);
                        goose.fetchNoteCaptured = true;
                    }
                }
                return;
            }

            if (goose.currentState === shared.STATE.fetchWait && now >= goose.stateUntil) {
                setState(shared.STATE.fetchReturn, now, 2400 + shared.randomRange(0, 1400));
                return;
            }

            if (goose.currentState === shared.STATE.fetchReturn && shared.distance(goose.position.x, goose.position.y, goose.target.x, goose.target.y) < 18) {
                releaseFetchElement();
                setState(shared.STATE.idle, now, 900 + shared.randomRange(0, 800));
                return;
            }

            if (goose.currentState === shared.STATE.windowDrag) {
                if (!goose.draggedWindow || !env.isWindowVisible(goose.draggedWindow)) {
                    releaseDraggedWindow();
                    setState(shared.STATE.wander, now, 1500 + shared.randomRange(0, 1200));
                    return;
                }

                if (!goose.draggedWindowDestination) {
                    var currentBeak = getBeakWorldPosition();
                    var windowBeakDistance = shared.distance(currentBeak.x, currentBeak.y, goose.draggedWindowGrabPoint.x, goose.draggedWindowGrabPoint.y);
                    if (windowBeakDistance < 26) {
                        goose.draggedWindowDestination = env.getWindowDropTarget(goose.draggedWindow);
                        goose.target = getGooseTargetForBeakTarget({
                            x: goose.draggedWindowDestination.x + goose.draggedWindowGrabOffset.x,
                            y: goose.draggedWindowDestination.y + goose.draggedWindowGrabOffset.y,
                        });
                        goose.locomotion = "run";
                        env.playHonk(goose);
                    }
                    return;
                }

                var draggedRect = goose.draggedWindow.getBoundingClientRect();
                if (shared.distance(draggedRect.left, draggedRect.top, goose.draggedWindowDestination.x, goose.draggedWindowDestination.y) < 22 || now >= goose.stateUntil) {
                    releaseDraggedWindow();
                    setState(shared.STATE.idle, now, 700 + shared.randomRange(0, 700));
                    return;
                }
            }

            if (goose.currentState === shared.STATE.uiInteract) {
                if (!goose.pendingUiInteraction) {
                    setState(shared.STATE.wander, now, 1200 + shared.randomRange(0, 1200));
                    return;
                }

                var interactionBeak = getBeakWorldPosition();
                if (shared.distance(interactionBeak.x, interactionBeak.y, goose.pendingUiInteraction.point.x, goose.pendingUiInteraction.point.y) < 22) {
                    env.playHonk(goose);
                    goose.pendingUiInteraction.action();
                    goose.pendingUiInteraction = null;
                    setState(shared.STATE.idle, now, 700 + shared.randomRange(0, 700));
                    return;
                }

                if (now >= goose.stateUntil) {
                    goose.pendingUiInteraction = null;
                    setState(shared.STATE.wander, now, 1200 + shared.randomRange(0, 1200));
                    return;
                }
            }

            if (goose.currentState === shared.STATE.chase) {
                goose.target.x = typeof getGhostXCursor === "function" ? getGhostXCursor() - shared.FRAME_WIDTH * 0.35 : goose.target.x;
                goose.target.y = typeof getGhostYCursor === "function" ? getGhostYCursor() - shared.FRAME_HEIGHT * 0.5 : goose.target.y;
                maybeStartCursorGrab(now);
                if (now >= goose.stateUntil) {
                    setState(shared.STATE.wander, now, 1600 + shared.randomRange(0, 1600));
                }
                return;
            }

            if (goose.currentState === shared.STATE.cursorDrag) {
                var beak = getBeakWorldPosition();
                if (typeof setGhostCursorPosition === "function") {
                    setGhostCursorPosition(beak.x, beak.y);
                }
                if (now >= goose.stateUntil || isOffscreen(30)) {
                    if (typeof releaseGhostCursor === "function") {
                        releaseGhostCursor();
                    }
                    setState(shared.STATE.wander, now, 1400 + shared.randomRange(0, 1600));
                }
            }
        }

        function updateMotion(now, dt) {
            var desiredSpeed = 0;
            if (goose.currentState === shared.STATE.wander || goose.currentState === shared.STATE.fetchExit || goose.currentState === shared.STATE.fetchReturn) {
                desiredSpeed = goose.locomotion === "run" ? 180 : 95;
            } else if (goose.currentState === shared.STATE.chase) {
                desiredSpeed = getChaseSpeed(now);
            } else if (goose.currentState === shared.STATE.cursorDrag) {
                desiredSpeed = 250;
            } else if (goose.currentState === shared.STATE.uiInteract) {
                desiredSpeed = goose.locomotion === "run" ? 185 : 95;
            }

            var dx = goose.target.x - goose.position.x;
            var dy = goose.target.y - goose.position.y;
            var directionVector = shared.normalize(dx, dy);
            var desiredVelocityX = directionVector.x * desiredSpeed;
            var desiredVelocityY = directionVector.y * desiredSpeed;

            if (goose.currentState === shared.STATE.idle || goose.currentState === shared.STATE.fetchWait) {
                desiredVelocityX = 0;
                desiredVelocityY = 0;
            }

            var blend = shared.clamp(dt * 7.5, 0.08, 0.5);
            if (goose.currentState === shared.STATE.chase) {
                blend = shared.clamp(dt * 12.5, 0.18, 0.78);
            }
            goose.velocity.x += (desiredVelocityX - goose.velocity.x) * blend;
            goose.velocity.y += (desiredVelocityY - goose.velocity.y) * blend;
            goose.velocity.x *= 0.94;
            goose.velocity.y *= 0.94;

            goose.position.x += goose.velocity.x * dt;
            goose.position.y += goose.velocity.y * dt;

            if (goose.currentState !== shared.STATE.fetchExit && goose.currentState !== shared.STATE.fetchWait && goose.currentState !== shared.STATE.cursorDrag) {
                goose.position.x = shared.clamp(goose.position.x, -30, window.innerWidth - shared.FRAME_WIDTH + 20);
                goose.position.y = shared.clamp(goose.position.y, 10, window.innerHeight - shared.FRAME_HEIGHT - 12);
            }

            goose.currentDirection = getDirectionFromVector(goose.velocity.x, goose.velocity.y);
        }

        function render(dt) {
            goose.root.style.transform = "translate3d(" + goose.position.x + "px, " + goose.position.y + "px, 0)";
            updateSprite(dt);
            updateFetchElement();
            updateDraggedWindow();
        }

        function spawnFromEdge() {
            var summonEdge = env.chooseSummonEdge();
            goose.position.x = summonEdge.x;
            goose.position.y = summonEdge.y;
            goose.target = env.getSummonTarget(summonEdge);
            goose.velocity.x = 0;
            goose.velocity.y = 0;
            goose.currentDirection = summonEdge.side === "left" ? "E" : "W";
            goose.animationTime = 0;
            goose.lastFrameKey = "";
            goose.root.style.display = "block";
            setState(shared.STATE.wander, performance.now(), 2200);
            render(0);
            env.playHonk(goose);
        }

        function updateFrame(now, dt) {
            updateState(now);
            updateMotion(now, dt);
            render(dt);
        }
    }

    globalScope.GooseActor = {
        createActor: createActor,
    };
})(window);
