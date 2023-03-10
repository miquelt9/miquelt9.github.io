const boxes = ["mainbox", "skillsbox", "projectsbox", "contactmebox", "terminalbox", "spaceshooterbox", "snakebox"]

const pos_boxes = []

document.addEventListener("DOMContentLoaded", function(event) {
    //Load pos boxes (used for keeping the z-index of each box)
    for (let i = 0; i < boxes.length; i++) {
      pos_boxes.push(i);
    }
    // window.alert(boxes);
    for (let i = 0; i < boxes.length; i++) {
      dragElement(document.getElementById(boxes[i]));
      document.getElementById(boxes[i]).style.zIndex = pos_boxes[i];
    }
    setInterval(getCurrentTime, 1000);
});

function showWindow(window) {
  bringToFront(window);
  document.getElementById(window).style.display = "block";
  document.getElementById(window + "Taskbar").style.display = "block";
}

function hideWindow(window) {
  document.getElementById(window).style.display = "none";
  document.getElementById(window + "Taskbar").style.display = "none";
}

// Just used for spaceshootergame box
function closeWindow(window) {
  var iframe = document.getElementById(window + "game");
  iframe.remove();
  document.getElementById(window + "box").style.display = "none";
  document.getElementById(window + "box" + "Taskbar").style.display = "none";
}

// Just used for spaceshootergame box
function openWindow(window) {
  bringToFront(window + "box");
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

function toggle(window) {
  var current = document.getElementById(window).style.display;
  if (current == "none") {
    bringToFront(window);
    document.getElementById(window).style.display = "block"; 
  }
  else {
    document.getElementById(window).style.display = "none";  
  }
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
  // alert("inside dragElement " + elmnt.id)
  elmnt.onmousedown = activeWindow;
  if (document.getElementById(elmnt.id + "header")) {
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    bringToFront(elmnt.id);
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
    var pos_value = pos_boxes[position];
    // window.alert("element: " + elmnt.id);
    if (pos_value != boxes.length) {
      for(let i = 0; i < boxes.length; i++) {
        if (boxes[i] == elmnt.id) {
          pos_boxes[i] = boxes.length;
          document.getElementById(boxes[i]).style.zIndex = pos_boxes[i];
        } else if (document.getElementById(boxes[i]).style.zIndex > pos_value) {
          pos_boxes[i] -= 1;
          document.getElementById(boxes[i]).style.zIndex = pos_boxes[i];
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

function elementPos(elmnt_id) {
  for(let i=0; i<boxes.length; i++) {
    if (boxes[i] == elmnt_id) return i;
  }
}

function bringToFront(window) {
  var position = elementPos(window);
  var pos_value = pos_boxes[position];

  if (pos_value != boxes.length) {
    for(let i=0; i<boxes.length; i++) {
      if (boxes[i] == window) {
        pos_boxes[i] = boxes.length;
        document.getElementById(boxes[i]).style.zIndex = pos_boxes[i];
      } else if (document.getElementById(boxes[i]).style.zIndex > pos_value) {
        pos_boxes[i] -= 1;
        document.getElementById(boxes[i]).style.zIndex = pos_boxes[i];      }
    }
  }
}