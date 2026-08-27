(function initRickroll(globalScope) {
  globalScope.rickCount = 0;

  async function nevergonna() {
    globalScope.rickCount += 1;
    if (globalScope.rickCount >= 3) {
      window.ProcessRegistry.populateProcess("rick_astley");
      var audio = new Audio('sounds/nevergonna.mp3');
      audio.play();
      await window.AppUtils.delay(1000);
      var rick = document.getElementById("rick");
      if (!rick) {
        rick = document.createElement("img");
        rick.id = "rick";
        rick.className = "rick";
        rick.src = "images/nevergonna.gif";
        rick.alt = "";
        var desktop = document.querySelector(".desktop_device");
        (desktop || document.body).appendChild(rick);
      }
      rick.style.display = "block";
      await window.AppUtils.delay(15500);
      rick.style.display = "none";
      window.ProcessRegistry.killProcessNamed("rick_astley");
    }
  }

  globalScope.nevergonna = nevergonna;
})(window);
