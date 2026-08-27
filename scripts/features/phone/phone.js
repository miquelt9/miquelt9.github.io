(function initPhone(globalScope) {
  function isPhoneViewport() {
    return window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
  }

  function openPhoneApp(appId) {
    if (!isPhoneViewport()) return;
    var map = { about: "aboutbox-mobile", projects: "projectsbox-mobile", contact: "contactmebox-mobile" };
    var app = document.getElementById(map[appId]);
    if (!app) return;
    document.querySelectorAll(".phone-window").forEach(function (element) {
      element.style.display = "none";
    });
    app.style.display = "block";
    document.getElementById("phone-os").classList.add("phone-app-open");
  }

  function closePhoneApp() {
    var shell = document.getElementById("phone-os");
    if (!shell) return;
    shell.classList.remove("phone-app-open");
    shell.querySelectorAll(".phone-window").forEach(function (element) {
      element.style.display = "none";
    });
  }

  globalScope.isPhoneViewport = isPhoneViewport;
  globalScope.openPhoneApp = openPhoneApp;
  globalScope.closePhoneApp = closePhoneApp;
})(window);
