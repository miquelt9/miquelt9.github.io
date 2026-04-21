(function initProcessRegistry(globalScope) {
  var processes = {};

  function populateProcess(processWindow, user) {
    var processUser = user || "user";
    var processId = 0;
    if (Object.keys(processes).length === 0) {
      processId = globalScope.AppUtils.getRandomInt(15615, 25548);
    } else {
      var keys = Object.keys(processes);
      processId = parseInt(keys[0], 10) + globalScope.AppUtils.getRandomInt(7, 37);
    }

    if (Object.prototype.hasOwnProperty.call(processes, processId)) {
      return populateProcess(processWindow, processUser);
    }

    processes[processId] = [processId, processUser, "pts/1", new Date(), processWindow];
    return processId;
  }

  function killProcessNamed(processName) {
    for (var key in processes) {
      if (Object.prototype.hasOwnProperty.call(processes, key)) {
        var process = processes[key];
        if (process.indexOf(processName) >= 0) {
          delete processes[key];
        }
      }
    }
  }

  function getProcessName(processId) {
    return processes[processId] ? processes[processId][4] : undefined;
  }

  function killProcessId(processId) {
    var processName = getProcessName(processId);
    if (!processName) {
      return;
    }

    if (processName === "desktop") {
      globalScope.createBlueWindow();
    } else if (processName === "taskbar") {
      document.getElementById(processName).remove();
      killProcessNamed("clock");
      killProcessNamed("startmenu");
    } else if (processName === "clock" || processName === "startmenu") {
      document.getElementById(processName).remove();
    } else if (processName === "icons") {
      var icons = ["aboutme", "projects", "contactme", "terminal"];
      for (var i = 0; i < icons.length; i++) {
        document.getElementById(icons[i]).remove();
      }
    } else if (processName === "bash") {
      globalScope.hideWindow("terminalbox");
      document.getElementById("terminalcontent").innerHTML = '<pre id="term-contents">~$ <span class="cursor"></span></pre>';
      globalScope.start();
    } else if (processName === "spaceshooter" || processName === "snake") {
      globalScope.closeWindow(processName);
    } else if (processName === "snaketerm") {
      if (typeof globalScope.stopTerminalSnakeGame === "function") {
        globalScope.stopTerminalSnakeGame();
      }
    } else {
      globalScope.hideWindow(processName);
    }

    delete processes[processId];
  }

  globalScope.ProcessRegistry = {
    processes: processes,
    populateProcess: populateProcess,
    killProcessNamed: killProcessNamed,
    killProcessId: killProcessId,
    getProcessName: getProcessName,
  };
})(window);
