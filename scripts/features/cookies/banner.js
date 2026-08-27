(function initCookiesBanner(globalScope) {
  function dismissCookiesBanner() {
    var banner = document.getElementById("cookies-banner");
    if (banner) {
      banner.style.display = "none";
    }
  }

  function showCookiesBanner() {
    var banner = document.getElementById("cookies-banner");
    if (banner) {
      banner.style.display = "";
    }
  }

  function setupCookiesBanner() {
    var banner = document.getElementById("cookies-banner");
    if (!banner) {
      return;
    }

    var acceptButton = document.getElementById("cookies-banner-accept");
    var rejectButton = document.getElementById("cookies-banner-reject");

    if (rejectButton) rejectButton.addEventListener("click", dismissCookiesBanner);
    if (acceptButton) acceptButton.addEventListener("click", function () {
      dismissCookiesBanner();
      startCookieGame();
    });
  }

  globalScope.dismissCookiesBanner = dismissCookiesBanner;
  globalScope.showCookiesBanner = showCookiesBanner;
  globalScope.setupCookiesBanner = setupCookiesBanner;
})(window);
