const boxes = ["mainbox", "skillsbox", "projectsbox", "contactmebox", "terminalbox", "spaceshooterbox"]

const pos_boxes = [81, 82, 83, 84, 85, 86]

document.addEventListener("DOMContentLoaded", function(event) {
    for(let i=0; i<boxes.length; i++) {
      dragElement(document.getElementById(boxes[i]));
    }
    setInterval(getCurrentTime, 1000);
});


function showWindow(window) {
  document.getElementById(window).style.display = "block";
  document.getElementById(window + "Taskbar").style.display = "block";
}

function hideWindow(window) {
  document.getElementById(window).style.display = "none";
  document.getElementById(window + "Taskbar").style.display = "none";
}

function closeWindow(window) {

  var iframe = document.getElementById(window + "game");
  iframe.remove();
  document.getElementById(window + "box").style.display = "none";
  document.getElementById(window + "box" + "Taskbar").style.display = "none";
}

function openWindow(window) {
  document.getElementById(window + "box").style.display = "block";
  document.getElementById(window + "box" + "Taskbar").style.display = "block";

  var ifrm = document.createElement("iframe");
  document.getElementById(window).appendChild(ifrm);

  ifrm.id = window + "game";
  ifrm.mozallowfullscreen = "true";
  ifrm.allow = "autoplay; fullscreen";
  ifrm.style = "border:0px #000000 none;";
  ifrm.msallowfullscreen = "true";
  ifrm.allowfullscreen = "true";
  ifrm.webkitallowfullscreen = "true";
  ifrm.allowtransparency = "true";
  ifrm.frameborder = "0";
  ifrm.marginheight="px";
  ifrm.marginwidth="320px";
  ifrm.height="780px";
  ifrm.width="1280px"
  ifrm.src = "/static/spaceshooter/index.html";
}

function minimise(window) {
  document.getElementById(window).style.display = "none";
}

function maximise(window) {
  document.getElementById(window).style.display = "block";
}

function startMenu() {
  var element = document.getElementById('startMenu');
  if (element.style.display == "none"){
    element.style.display = "block";
  } else {
    element.style.display = "none";
  }

}

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  elmnt.onmousedown = activeWindow;
  if (document.getElementById(elmnt.id + "header")) {
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }

  function activeWindow(e) {
    e = e || window.event;
    
    var position = elementPos();

    if (position != 100) {
      for(let i=0; i<boxes.length; i++) {
        if (boxes[i] == elmnt.id) {
          pos_boxes[i] == 100;
          document.getElementById(boxes[i]).style.zIndex = 100;
        } else {
          if (document.getElementById(boxes[i]).style.zIndex > 1) {
            document.getElementById(boxes[i]).style.zIndex = --pos_boxes[i];
          }
        }
      }
    }
  }

  function elementPos() {
    for(let i=0; i<boxes.length; i++) {
      if (boxes[i] == elmnt.id) return i;
    }
  }
}

function getCurrentTime() {
  var now = new Date();
  var time = now.getHours() + ":" + now.getMinutes().toString().padStart(2, 0);
  document.getElementById('clock').innerHTML = time;
}