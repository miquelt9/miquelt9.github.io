(function initGooseShared(globalScope) {
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

    function normalize(x, y) {
        var magnitude = Math.sqrt(x * x + y * y) || 1;
        return { x: x / magnitude, y: y / magnitude };
    }

    function svgToDataUri(svg) {
        return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
    }

    globalScope.GooseShared = {
        FRAME_WIDTH: 88,
        FRAME_HEIGHT: 72,
        SHEET_FRAME_WIDTH: 112,
        SHEET_FRAME_HEIGHT: 112,
        FRAME_PADDING_X: 18,
        FRAME_PADDING_Y: 22,
        SPRITE_ROWS: ["E", "SE", "S", "SW", "W", "NW", "N", "NE"],
        STATE_COLUMNS: {
            idle: { offset: 0, frames: 4, fps: 4 },
            walk: { offset: 4, frames: 6, fps: 9 },
            run: { offset: 10, frames: 6, fps: 14 },
        },
        TOTAL_COLUMNS: 16,
        FOOT_CONTACT: {
            walk: { 1: -1, 4: 1 },
            run: { 1: -1, 4: 1 },
        },
        STATE: {
            idle: "idle",
            wander: "wander",
            fetchExit: "fetch_exit",
            fetchWait: "fetch_wait",
            fetchReturn: "fetch_return",
            chase: "chase",
            cursorDrag: "cursor_drag",
            windowDrag: "window_drag",
            uiInteract: "ui_interact",
        },
        TAUNTS: [
            "i cause problems on purpose",
            "busy busy busy",
            "a very important goose memo",
            "productivity? never heard of it",
        ],
        randomRange: randomRange,
        clamp: clamp,
        distance: distance,
        normalize: normalize,
        svgToDataUri: svgToDataUri,
    };
})(window);
