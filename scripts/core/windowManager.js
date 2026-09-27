(function initWindowManager(globalScope) {
  var boxes = ["aboutbox", "projectsbox", "contactmebox", "terminalbox", "spaceshooterbox", "snakebox", "cvbox", "canbox"];
  var positions = [];

  function initialize() {
    positions.length = 0;
    for (var i = 0; i < boxes.length; i++) {
      positions.push(i);
    }

    for (var j = 0; j < boxes.length; j++) {
      var element = document.getElementById(boxes[j]);
      if (!element) {
        continue;
      }
      dragElement(element);
      element.style.zIndex = positions[j];
    }
  }

  function elementPos(elementId) {
    for (var i = 0; i < boxes.length; i++) {
      if (boxes[i] === elementId) {
        return i;
      }
    }
    return -1;
  }

  function bringToFront(windowId) {
    var position = elementPos(windowId);
    if (position < 0) {
      return;
    }
    var currentZ = positions[position];

    if (currentZ !== boxes.length) {
      for (var i = 0; i < boxes.length; i++) {
        var currentId = boxes[i];
        var currentElement = document.getElementById(currentId);
        if (!currentElement) {
          continue;
        }

        if (currentId === windowId) {
          positions[i] = boxes.length;
          currentElement.style.zIndex = positions[i];
        } else if (parseInt(currentElement.style.zIndex, 10) > currentZ) {
          positions[i] -= 1;
          currentElement.style.zIndex = positions[i];
        }
      }
    }
  }

  function dragElement(element) {
    var pos1 = 0;
    var pos2 = 0;
    var pos3 = 0;
    var pos4 = 0;
    element.onmousedown = activeWindow;
    var header = document.getElementById(element.id + "header");
    var maximizeButton = findMaximizeButton(element);
    if (header) {
      header.onmousedown = dragMouseDown;
      header.ondblclick = toggleMaximizedFromEvent;
    } else {
      element.onmousedown = dragMouseDown;
      element.ondblclick = toggleMaximizedFromEvent;
    }

    if (maximizeButton) {
      maximizeButton.onclick = function toggleFromButton(event) {
        if (event) {
          event.stopPropagation();
        }
        bringToFront(element.id);
        toggleMaximized(element);
      };
    }

    function dragMouseDown(e) {
      bringToFront(element.id);
      var event = e || window.event;
      event.preventDefault();
      pos3 = event.clientX;
      pos4 = event.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      var event = e || window.event;
      event.preventDefault();
      pos1 = pos3 - event.clientX;
      pos2 = pos4 - event.clientY;
      pos3 = event.clientX;
      pos4 = event.clientY;
      element.style.top = element.offsetTop - pos2 + "px";
      element.style.left = element.offsetLeft - pos1 + "px";
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }

    function activeWindow() {
      bringToFront(element.id);
    }

    function toggleMaximizedFromEvent(event) {
      if (event && event.target && event.target.classList && event.target.classList.contains("buttons")) {
        return;
      }
      bringToFront(element.id);
      toggleMaximized(element);
    }
  }

  function findMaximizeButton(element) {
    var header = document.getElementById(element.id + "header");
    if (!header) {
      return null;
    }
    var topbarButtons = header.querySelectorAll(".topbarButton, .terminaltopbarButton");
    for (var i = 0; i < topbarButtons.length; i++) {
      if (topbarButtons[i].textContent.trim() === "□") {
        return topbarButtons[i];
      }
    }
    return null;
  }

  function toggleMaximized(element) {
    if (element.dataset.isMaximized === "true") {
      restoreWindow(element);
      return;
    }
    maximizeWindow(element);
  }

  function maximizeWindow(element) {
    element.dataset.prevTop = element.style.top || "";
    element.dataset.prevLeft = element.style.left || "";
    element.dataset.prevWidth = element.style.width || "";
    element.dataset.prevHeight = element.style.height || "";
    element.dataset.prevMaxWidth = element.style.maxWidth || "";
    element.dataset.prevMaxHeight = element.style.maxHeight || "";
    element.dataset.prevMinWidth = element.style.minWidth || "";
    element.dataset.prevMinHeight = element.style.minHeight || "";

    var taskbar = document.getElementById("taskbar");
    var taskbarHeight = taskbar ? taskbar.offsetHeight : 0;
    element.style.top = "0px";
    element.style.left = "0px";
    element.style.width = window.innerWidth + "px";
    element.style.height = Math.max(0, window.innerHeight - taskbarHeight) + "px";
    element.style.maxWidth = "none";
    element.style.maxHeight = "none";
    element.style.minWidth = "0";
    element.style.minHeight = "0";
    element.dataset.isMaximized = "true";
  }

  function restoreWindow(element) {
    element.style.top = element.dataset.prevTop || "";
    element.style.left = element.dataset.prevLeft || "";
    element.style.width = element.dataset.prevWidth || "";
    element.style.height = element.dataset.prevHeight || "";
    element.style.maxWidth = element.dataset.prevMaxWidth || "";
    element.style.maxHeight = element.dataset.prevMaxHeight || "";
    element.style.minWidth = element.dataset.prevMinWidth || "";
    element.style.minHeight = element.dataset.prevMinHeight || "";
    element.dataset.isMaximized = "false";
  }

  globalScope.WindowManager = {
    boxes: boxes,
    initialize: initialize,
    bringToFront: bringToFront,
    elementPos: elementPos,
  };
})(window);
