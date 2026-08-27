(function initStartMenu(globalScope) {
  var startMenuAutoCloseRegistered = false;

  function getStartMenuElement() {
    return document.getElementById("startbutton");
  }

  function isStartMenuOpen() {
    var element = getStartMenuElement();
    if (!element) {
      return false;
    }
    return window.getComputedStyle(element).display !== "none";
  }

  function closeStartMenu() {
    var element = getStartMenuElement();
    if (!element) {
      return;
    }
    element.style.display = "none";
  }

  function openStartMenu() {
    var element = getStartMenuElement();
    if (!element) {
      return;
    }
    element.style.display = "block";
  }

  function registerStartMenuAutoClose() {
    if (startMenuAutoCloseRegistered) {
      return;
    }

    document.addEventListener("click", function onDocumentClick(event) {
      if (!isStartMenuOpen()) {
        return;
      }

      var target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest("#startbutton") || target.closest("#startmenu-btn")) {
        return;
      }

      closeStartMenu();
    });

    startMenuAutoCloseRegistered = true;
  }

  function startMenu() {
    if (isStartMenuOpen()) {
      closeStartMenu();
    } else {
      openStartMenu();
    }
  }

  globalScope.registerStartMenuAutoClose = registerStartMenuAutoClose;
  globalScope.startMenu = startMenu;
})(window);
