(function initGoose(globalScope) {
    var shared = globalScope.GooseShared;
    var visuals = globalScope.GooseVisuals;
    var environmentApi = globalScope.GooseEnvironment;
    var actorApi = globalScope.GooseActor;

    if (!shared || !visuals || !environmentApi || !actorApi) {
        globalScope.showGoose = function showGoose() {};
        return;
    }

    var geese = [];
    var nextGooseId = 1;
    var animationLoopActive = false;
    var lastFrameAt = 0;
    var environment = environmentApi.createEnvironment({
        getGeese: function getGeese() {
            return geese;
        },
    });

    function frame(now) {
        if (geese.length === 0) {
            animationLoopActive = false;
            lastFrameAt = 0;
            return;
        }

        if (!lastFrameAt) {
            lastFrameAt = now;
        }
        var dt = Math.min(0.05, (now - lastFrameAt) / 1000);
        lastFrameAt = now;

        for (var i = 0; i < geese.length; i += 1) {
            geese[i].updateFrame(now, dt);
        }

        requestAnimationFrame(frame);
    }

    function start() {
        if (!environment.ensureSharedDom()) {
            return;
        }

        var goose = actorApi.createActor(nextGooseId, environment);
        nextGooseId += 1;
        geese.push(goose);

        if (!animationLoopActive) {
            animationLoopActive = true;
            lastFrameAt = 0;
            requestAnimationFrame(frame);
        }
    }

    globalScope.GooseVirus = {
        start: start,
    };

    globalScope.showGoose = function showGoose() {
        globalScope.GooseVirus.start();
    };
})(window);