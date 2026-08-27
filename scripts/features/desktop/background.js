(function initDesktopBackground(globalScope) {
  function getRandomColor() {
    const h = window.AppUtils.getRandomInt(0, 360);
    const s = window.AppUtils.getRandomInt(50, 95);
    const l = window.AppUtils.getRandomInt(60, 90);

    return `hsl(${h},${s}%,${l}%)`;
  }

  function changeBackgroundColor() {
    document.getElementById("the_background").style.backgroundColor = getRandomColor();
  }

  globalScope.getRandomColor = getRandomColor;
  globalScope.changeBackgroundColor = changeBackgroundColor;
})(window);
