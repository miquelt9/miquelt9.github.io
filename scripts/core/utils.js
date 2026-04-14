(function initCoreUtils(globalScope) {
  function delay(time) {
    return new Promise(function resolveAfterTimeout(resolve) {
      setTimeout(resolve, time);
    });
  }

  function getRandomInt(min, max) {
    var ceilMin = Math.ceil(min);
    var floorMax = Math.floor(max);
    return Math.floor(Math.random() * (floorMax - ceilMin + 1)) + ceilMin;
  }

  globalScope.AppUtils = {
    delay: delay,
    getRandomInt: getRandomInt,
  };
})(window);
