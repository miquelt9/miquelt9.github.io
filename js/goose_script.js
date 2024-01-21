function showGoose(goose) {
    document.getElementById(goose).style.display = "block";
    document.getElementById(goose).style.left = "0px";
    document.getElementById(goose).style.top = "200px";
}

let mousePosX = 0;
let mousePosY = 0;
var animation_on_progress = false;

var xDiff = 0;
var yDiff = 0;

document.addEventListener('DOMContentLoaded', () => {
    
    g_body = document.getElementById('goose1');      
    g_nose = document.getElementById('goose_nose1');    
    g_neck = document.getElementById('goose_neck1');    
    g_head = document.getElementById('goose_head1');    
  
    let delay = 80,
        revisedMousePosX = 0,
        revisedMousePosY = 0;
        rect = g_body.getBoundingClientRect();
        goosePosX = rect.left;
        goosePosY = rect.top;

    document.addEventListener("mousemove", function (e) {
        mousePosX = e.pageX-27;
        mousePosY = e.pageY-12;
        rect = g_body.getBoundingClientRect();
        goosePosX = rect.left;
        goosePosY = rect.top;

        xDiff = mousePosX - goosePosX;
        yDiff = mousePosY - goosePosY;

        if (!animation_on_progress && Math.abs(xDiff) > 30 && Math.abs(yDiff) > 30) {
            // console.log("request animation");
            animation_on_progress = true;
            requestAnimationFrame(delayMouseFollow);

        } else if (!animation_on_progress && (Math.abs(xDiff) > 70 || Math.abs(yDiff) > 70)) {
            // console.log("request animation");
            animation_on_progress = true;
            requestAnimationFrame(delayMouseFollow);

        } else if (!animation_on_progress) {
            var angle = Math.atan2(yDiff, xDiff);
            var angleDeg = angle*57.2957795;

            g_nose.style.bottom = -((Math.abs(angleDeg)-90)/2.5)-9 + 'px';
            g_neck.style.bottom = -((Math.abs(angleDeg)-90)/5)+5 + 'px';
            g_head.style.bottom = -((Math.abs(angleDeg)-90)/3)+3 + 'px';

            g_body.style.rotate = (angle) + 'rad';
        }

    })
  
    function delayMouseFollow() {
        xDiff = mousePosX - revisedMousePosX;
        yDiff = mousePosY - revisedMousePosY;
        var angle = Math.atan2(yDiff, xDiff);
  
        if (xDiff < 0)  xDiff += 30;
        else            xDiff -= 30;
        if (yDiff < 0)  yDiff += 30;
        else            yDiff -= 30;

        // console.log(xDiff + " " + yDiff);

        revisedMousePosX += (xDiff) / delay;
        revisedMousePosY += (yDiff) / delay; 
  
        if (Math.abs(yDiff) < 30 && Math.abs(xDiff) < 30) {
            // console.log("animation completed");
            animation_on_progress = false;
        } else {
            requestAnimationFrame(delayMouseFollow);    
        }
  
        g_body.style.top = revisedMousePosY + 'px';
        g_body.style.left = revisedMousePosX + 'px';
  
        var angleDeg = angle*57.2957795;
        // console.log(((Math.abs(angleDeg)-90)/4));
        // console.log(g_nose.getBoundingClientRect().top);
        g_nose.style.bottom = -((Math.abs(angleDeg)-90)/2.5)-9 + 'px';
        g_neck.style.bottom = -((Math.abs(angleDeg)-90)/5)+5 + 'px';
        g_head.style.bottom = -((Math.abs(angleDeg)-90)/3)+3 + 'px';

        g_body.style.rotate = (angle) + 'rad';

    }
  });






