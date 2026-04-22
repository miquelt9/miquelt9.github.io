(function initGooseVisuals(globalScope) {
    var shared = globalScope.GooseShared;

    function getStrideProfile(animState, phase) {
        var walkLeft = [0, 5, 1, 0, -1, 2];
        var walkRight = [1, 0, -1, 5, 1, 0];
        var runLeft = [0, 8, 2, 0, -2, 4];
        var runRight = [2, 0, -2, 8, 2, 0];
        var idleLeft = [0, 1, 0, 1];
        var idleRight = [1, 0, 1, 0];

        if (animState === "run") {
            return { left: runLeft[phase], right: runRight[phase] };
        }
        if (animState === "walk") {
            return { left: walkLeft[phase], right: walkRight[phase] };
        }
        return { left: idleLeft[phase], right: idleRight[phase] };
    }

    function getDirectionPose(direction) {
        return {
            E: { row: 0, angle: 0, vx: 1, vy: 0 },
            SE: { row: 1, angle: 45, vx: 0.707, vy: 0.707 },
            S: { row: 2, angle: 90, vx: 0, vy: 1 },
            SW: { row: 3, angle: 135, vx: -0.707, vy: 0.707 },
            W: { row: 4, angle: 180, vx: -1, vy: 0 },
            NW: { row: 5, angle: 225, vx: -0.707, vy: -0.707 },
            N: { row: 6, angle: 270, vx: 0, vy: -1 },
            NE: { row: 7, angle: 315, vx: 0.707, vy: -0.707 },
        }[direction];
    }

    function drawShadowDots(centerX, centerY) {
        var dots = [
            [-16, 7], [-9, 8], [-2, 9], [5, 8], [12, 7],
            [-12, 3], [-5, 4], [2, 4], [9, 3],
            [-8, -1], [-1, 0], [6, -1],
        ];
        var output = '<g opacity="0.58">';
        for (var i = 0; i < dots.length; i += 1) {
            output += '<rect x="' + (centerX + dots[i][0]) + '" y="' + (centerY + dots[i][1]) + '" width="4" height="4" rx="0.9" fill="rgba(160,160,160,0.38)" />';
        }
        output += "</g>";
        return output;
    }

    function drawFrame(column, row, animState, phase, direction) {
        var pose = getDirectionPose(direction);
        var stride = getStrideProfile(animState, phase);
        var baseX = column * shared.SHEET_FRAME_WIDTH + shared.FRAME_PADDING_X;
        var baseY = row * shared.SHEET_FRAME_HEIGHT + shared.FRAME_PADDING_Y;
        var centerX = baseX + 38;
        var centerY = baseY + 34 + (animState === "idle" ? Math.sin(phase * 1.2) * 1.1 : 0);
        var bodyStretch = animState === "run" ? 1.7 : animState === "walk" ? 0.9 : 0.2;
        var headReach = animState === "run" ? 5 : animState === "walk" ? 2.5 : 0;
        var leftFootLift = Math.max(0, stride.left);
        var rightFootLift = Math.max(0, stride.right);
        var leftFootX = centerX - 2;
        var rightFootX = centerX + 8;
        var leftFootY = centerY + 15 - leftFootLift;
        var rightFootY = centerY + 16 - rightFootLift;
        var neckTopX = centerX + 22 + headReach;
        var neckTopY = centerY - 14 - bodyStretch * 0.6;
        var headX = centerX + 30 + headReach;
        var headY = centerY - 16 - bodyStretch * 0.7;
        var beakX = headX + 10;
        var beakY = headY;
        var bodyTilt = animState === "run" ? Math.sin(phase * 1.6) * 1.4 : Math.sin(phase * 1.25) * 0.8;

        return (
            drawShadowDots(centerX + 2, centerY + 13) +
            '<g transform="rotate(' + pose.angle + " " + centerX + " " + centerY + ')">' +
                '<rect x="' + leftFootX + '" y="' + leftFootY + '" width="6.5" height="9" rx="2.1" fill="#f5a10f" />' +
                '<rect x="' + rightFootX + '" y="' + rightFootY + '" width="6.5" height="9" rx="2.1" fill="#f5a10f" />' +
                '<ellipse cx="' + (centerX - 18) + '" cy="' + (centerY + 1) + '" rx="13" ry="10.5" fill="#ffffff" />' +
                '<ellipse cx="' + (centerX - 2) + '" cy="' + centerY + '" rx="21" ry="15.8" fill="#ffffff" />' +
                '<ellipse cx="' + (centerX + 12) + '" cy="' + (centerY + bodyTilt * 0.2) + '" rx="16" ry="13.6" fill="#ffffff" />' +
                '<ellipse cx="' + (centerX + 2) + '" cy="' + (centerY + 6.5) + '" rx="21" ry="6.5" fill="#f3f3f3" opacity="0.88" />' +
                '<path d="M ' + (centerX + 13) + " " + (centerY - 7) + " Q " + (centerX + 21) + " " + (centerY - 18 - bodyStretch) + " " + neckTopX + " " + neckTopY + '" stroke="#ffffff" stroke-width="10.5" fill="none" stroke-linecap="round" />' +
                '<circle cx="' + headX + '" cy="' + headY + '" r="10.4" fill="#ffffff" />' +
                '<ellipse cx="' + beakX + '" cy="' + beakY + '" rx="8.8" ry="4.9" fill="#f5a10f" />' +
                '<circle cx="' + (headX - 2.6) + '" cy="' + (headY - 3.2) + '" r="1.8" fill="#151515" />' +
                '<circle cx="' + (headX + 2.4) + '" cy="' + (headY - 2.2) + '" r="1.6" fill="#151515" opacity="0.88" />' +
            "</g>"
        );
    }

    function buildSpriteSheet() {
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + (shared.SHEET_FRAME_WIDTH * shared.TOTAL_COLUMNS) + '" height="' + (shared.SHEET_FRAME_HEIGHT * shared.SPRITE_ROWS.length) + '" viewBox="0 0 ' + (shared.SHEET_FRAME_WIDTH * shared.TOTAL_COLUMNS) + " " + (shared.SHEET_FRAME_HEIGHT * shared.SPRITE_ROWS.length) + '">';
        for (var row = 0; row < shared.SPRITE_ROWS.length; row += 1) {
            var direction = shared.SPRITE_ROWS[row];
            for (var idleFrame = 0; idleFrame < shared.STATE_COLUMNS.idle.frames; idleFrame += 1) {
                svg += drawFrame(shared.STATE_COLUMNS.idle.offset + idleFrame, row, "idle", idleFrame, direction);
            }
            for (var walkFrame = 0; walkFrame < shared.STATE_COLUMNS.walk.frames; walkFrame += 1) {
                svg += drawFrame(shared.STATE_COLUMNS.walk.offset + walkFrame, row, "walk", walkFrame, direction);
            }
            for (var runFrame = 0; runFrame < shared.STATE_COLUMNS.run.frames; runFrame += 1) {
                svg += drawFrame(shared.STATE_COLUMNS.run.offset + runFrame, row, "run", runFrame, direction);
            }
        }
        svg += "</svg>";
        return shared.svgToDataUri(svg);
    }

    function buildFetchElement(propLayer) {
        var element = document.createElement("div");
        var isNote = Math.random() < 0.6;
        element.className = "goose-fetch-item goose-fetch-stack";

        function noteWindow(extraClass) {
            var taunts = (window.i18n ? window.i18n.t('goose.taunts') : shared.TAUNTS);
            return (
                '<div class="goose-fetch-window goose-fetch-window--note ' + extraClass + '">' +
                    '<div class="goose-fetch-window-title goose-fetch-window-title--with-close">' +
                        '<span class="goose-fetch-window-title-label">' + (window.i18n ? window.i18n.t('goose.notepad') : 'Goose "Not-epad"') + '</span>' +
                        '<button class="goose-fetch-window-close" type="button" aria-label="' + (window.i18n ? window.i18n.t('goose.closeNote') : 'Close goose note') + '">X</button>' +
                    "</div>" +
                    '<div class="goose-fetch-window-body">' +
                        '<div class="goose-fetch-note-text">' + taunts[Math.floor(Math.random() * taunts.length)] + '</div>' +
                    "</div>" +
                "</div>"
            );
        }

        function imageWindow(extraClass, src, caption) {
            return (
                '<div class="goose-fetch-window goose-fetch-window--image ' + extraClass + '">' +
                    '<div class="goose-fetch-window-title goose-fetch-window-title--with-close">' +
                        '<span class="goose-fetch-window-title-label">' + (window.i18n ? window.i18n.t('goose.important') : 'Absolutely Important') + '</span>' +
                        '<button class="goose-fetch-window-close" type="button" aria-label="' + (window.i18n ? window.i18n.t('goose.closeImage') : 'Close goose image') + '">X</button>' +
                    "</div>" +
                    '<div class="goose-fetch-window-body">' +
                        '<img class="goose-fetch-image" src="' + src + '" alt="' + caption + '">' +
                        '<div class="goose-fetch-image-caption">' + caption + '</div>' +
                    "</div>" +
                "</div>"
            );
        }

        if (isNote) {
            element.setAttribute("data-goose-fetch-kind", "note");
            element.innerHTML = noteWindow("stack-a");
        } else {
            element.setAttribute("data-goose-fetch-kind", "image");
            element.innerHTML = imageWindow("stack-a", "goose-stonks.jpg", "goose stonks");
        }

        propLayer.appendChild(element);
        return element;
    }

    globalScope.GooseVisuals = {
        getDirectionPose: getDirectionPose,
        buildSpriteSheet: buildSpriteSheet,
        buildFetchElement: buildFetchElement,
    };
})(window);
