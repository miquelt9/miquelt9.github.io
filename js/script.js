const boxes = ["aboutbox", "skillsbox", "projectsbox", "contactmebox", "terminalbox", "spaceshooterbox", "snakebox", "cvbox", "canbox"]

const pos_boxes = []

var rickCount = 0;


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

async function nevergonna() {
  rickCount += 1;
  if (rickCount >= 3) {
    populate_process("rick_astley");
    var audio = new Audio('/sounds/nevergonna.mp3');
    audio.play();
    await delay(1000);
    document.getElementById("rick").style.display = "block";
    await delay(15500);
    document.getElementById("rick").style.display = "none";
    kill_process_named("rick_astley");
  }
}

function getRandomColor() {
  const h = getRandomInt(0, 360); // Random hue value (0-360)
  const s = getRandomInt(50, 95); // Random saturation value (50-100)
  const l = getRandomInt(60, 90); // Random lightness value (60-90)

  return `hsl(${h},${s}%,${l}%)`; // Construct the HSL color string
}

function changeBackgroundColor() {
  document.getElementById("the_background").style.backgroundColor = getRandomColor();
}

function showWindow(window) {
  var ps_window = window
  if (window === "terminalbox") {
    ps_window = "bash";
    define_bash_as_opened();
  }
  kill_process_named(ps_window);
  populate_process(ps_window);
  
  bringToFront(window);
  document.getElementById(window).style.display = "block";
  document.getElementById(window + "Taskbar").style.display = "block";
}

function hideWindow(window) {
  kill_process_named(window);
  if (window === "terminalbox") { define_bash_as_closed(); }
  document.getElementById(window).style.display = "none";
  document.getElementById(window + "Taskbar").style.display = "none";
}

// Just used for games box
function closeWindow(window) {
  kill_process_named(window);
  var iframe = document.getElementById(window + "game");
  iframe.remove();
  document.getElementById(window + "box").style.display = "none";
  document.getElementById(window + "box" + "Taskbar").style.display = "none";
}

// Just used for games box
function openWindow(window) {
  kill_process_named(window);
  populate_process(window);
  bringToFront(window + "box");
  document.getElementById(window + "box").style.display = "block";
  document.getElementById(window + "box" + "Taskbar").style.display = "block";

  if (window == 'spaceshooter') {
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

  if (window == 'snake') {
    // var jgame = document.createElement("canvas")
    // document.getElementById(window).appendChild(jgame);
    document.getElementById(window).innerHTML = '<canvas width="800" height="600" id="sgame"></canvas>';
    document.getElementById(window).outerHTML += '<script src="/js/snake.js"></script>';

  }
}

function minimise(window) {
  document.getElementById(window).style.display = "none";
}

// idk, but not really working + not worth since all the content 
// is already displayed when showing any window 
function maximise(window) {
  document.getElementById(window).style.width = "97vw";
  document.getElementById(window).style.height = "97vh";
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
  var element = document.getElementById('startbutton');
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