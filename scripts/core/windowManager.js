(function initWindowManager(globalScope) {
  var boxes = ["aboutbox", "skillsbox", "projectsbox", "contactmebox", "terminalbox", "spaceshooterbox", "snakebox", "cvbox", "canbox"];
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
    if (header) {
      header.onmousedown = dragMouseDown;
    } else {
      element.onmousedown = dragMouseDown;
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
  }

  globalScope.WindowManager = {
    boxes: boxes,
    initialize: initialize,
    bringToFront: bringToFront,
    elementPos: elementPos,
  };
})(window);
