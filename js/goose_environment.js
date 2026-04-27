(function initGooseEnvironment(globalScope) {
    var shared = globalScope.GooseShared;
    var visuals = globalScope.GooseVisuals;

    if (!shared || !visuals) {
        return;
    }

    function createEnvironment(options) {
        var getGeese = options && options.getGeese ? options.getGeese : function getGeeseFallback() {
            return [];
        };
        var footprintLayer = null;
        var propLayer = null;
        var spriteSheetUrl = "";
        var gooseSoundPath = "sounds/goose-sound.mp3";
        var isReady = false;

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

        function chooseSummonEdge() {
            var fromLeft = Math.random() < 0.5;
            return {
                side: fromLeft ? "left" : "right",
                x: fromLeft ? -shared.FRAME_WIDTH - 28 : window.innerWidth + 28,
                y: shared.randomRange(60, Math.max(60, window.innerHeight - shared.FRAME_HEIGHT - 72)),
            };
        }

        function getSummonTarget(edge) {
            var padding = 64;
            var maxX = Math.max(padding, window.innerWidth - shared.FRAME_WIDTH - padding);
            var edgeBand = Math.min(280, Math.max(120, window.innerWidth * 0.22));
            if (edge.side === "left") {
                return {
                    x: shared.randomRange(padding, Math.min(maxX, padding + edgeBand)),
                    y: shared.clamp(edge.y + shared.randomRange(-90, 90), 36, window.innerHeight - shared.FRAME_HEIGHT - 18),
                };
            }
            return {
                x: shared.randomRange(Math.max(padding, maxX - edgeBand), maxX),
                y: shared.clamp(edge.y + shared.randomRange(-90, 90), 36, window.innerHeight - shared.FRAME_HEIGHT - 18),
            };
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

        function isWindowGrabbed(element, excludedGooseId) {
            var geese = getGeese();
            for (var i = 0; i < geese.length; i += 1) {
                if (geese[i].id !== excludedGooseId && geese[i].draggedWindow === element) {
                    return true;
                }
            }
            return false;
        }

        function getWindowDragCandidates(goose) {
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
                if (isWindowGrabbed(element, goose ? goose.id : null)) {
                    continue;
                }
                candidates.push(element);
            }
            return candidates;
        }

        function chooseWindowDragTarget(goose) {
            var candidates = getWindowDragCandidates(goose);
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

        function getWindowGrabOffset(element, grabPoint) {
            var rect = element.getBoundingClientRect();
            return {
                x: grabPoint.x - rect.left,
                y: grabPoint.y - rect.top,
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

        function ensureSharedDom() {
            if (isReady) {
                return true;
            }

            spriteSheetUrl = visuals.buildSpriteSheet();

            footprintLayer = document.querySelector(".goose-trail-container");
            if (!footprintLayer) {
                footprintLayer = document.createElement("div");
                footprintLayer.className = "goose-trail-container";
                document.body.appendChild(footprintLayer);
            }

            propLayer = document.querySelector(".goose-gifts-container");
            if (!propLayer) {
                propLayer = document.createElement("div");
                propLayer.className = "goose-gifts-container";
                document.body.appendChild(propLayer);
            }

            isReady = true;
            return true;
        }

        function createRoot(gooseId) {
            var root = gooseId === 1 ? document.getElementById("goose1") : null;
            if (!root) {
                root = document.createElement("div");
                root.id = "goose" + gooseId;
                document.body.appendChild(root);
            }

            root.className = "goose-pet goose-root";
            root.innerHTML = '<div class="goose-pet-sprite" aria-hidden="true"></div>';
            root.setAttribute("aria-hidden", "true");
            root.style.display = "block";

            var sprite = root.firstElementChild;
            sprite.style.backgroundImage = 'url("' + spriteSheetUrl + '")';
            sprite.style.backgroundSize = (shared.SHEET_FRAME_WIDTH * shared.TOTAL_COLUMNS) + "px " + (shared.SHEET_FRAME_HEIGHT * shared.SPRITE_ROWS.length) + "px";

            return {
                root: root,
                sprite: sprite,
            };
        }

        function playHonk(goose) {
            try {
                var clip = new Audio(gooseSoundPath);
                clip.preload = "auto";
                clip.playbackRate = 1 + shared.randomRange(-0.04, 0.04);
                clip.volume = 0.85;
                var playResult = clip.play();
                if (playResult && typeof playResult.then === "function") {
                    playResult.catch(function onGooseSoundFailed() {});
                }
                if (goose) {
                    goose.lastHonkAt = performance.now();
                }
            } catch (error) {
                // Audio is optional if blocked by the browser.
            }
        }

        function buildFetchElement() {
            return visuals.buildFetchElement(propLayer);
        }

        function getFootprintLayer() {
            return footprintLayer;
        }

        return {
            getViewportTarget: getViewportTarget,
            chooseOffscreenEdge: chooseOffscreenEdge,
            chooseSummonEdge: chooseSummonEdge,
            getSummonTarget: getSummonTarget,
            chooseUiInteraction: chooseUiInteraction,
            chooseWindowDragTarget: chooseWindowDragTarget,
            getWindowGrabPoint: getWindowGrabPoint,
            getWindowGrabOffset: getWindowGrabOffset,
            getWindowDropTarget: getWindowDropTarget,
            ensureSharedDom: ensureSharedDom,
            createRoot: createRoot,
            playHonk: playHonk,
            buildFetchElement: buildFetchElement,
            getFootprintLayer: getFootprintLayer,
            isWindowVisible: isWindowVisible,
        };
    }

    globalScope.GooseEnvironment = {
        createEnvironment: createEnvironment,
    };
})(window);
