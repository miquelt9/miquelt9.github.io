var current_directory = "";

var stop_flag = false;
var bash_open = false;

var processes = {};
populate_process("bash");
populate_process("desktop", "root");
populate_process("taskbar", "root");
populate_process("startmenu", "root"); 
populate_process("clock", "root"); 
populate_process("icons", "root"); 


function populate_process(p_window, user = "user") {
    var process_id = 0;
    if (Object.keys(processes).length === 0) {
        process_id = getRandomInt(15615, 25548);
    }
    else {
        process_id = Object.keys(processes).length;
        keys = Object.keys(processes);
        process_id = parseInt(keys[0]) + getRandomInt(7,37);
    }

    if (processes.hasOwnProperty(process_id)) {
        populate_process(p_window);
    }
    else {
        var now = new Date();
        processes[process_id] = [process_id, user, "pts/1", now, p_window];
    }
    return process_id;
}

function kill_process_named(process_name) {
    for (let key in processes) {
        const process = processes[key];
        if (process.includes(process_name)) delete processes[key];
    }
}

function kill_process_id(process_id) {
    p_name = get_process_name(process_id);
    if (p_name == "desktop") {
        createBlueWindow();
    }
    else if (p_name == "taskbar") {
        document.getElementById(p_name).remove();
        kill_process_named("clock");
        kill_process_named("startmenu");
    }
    else if (p_name == "clock" || p_name == "startmenu") {
        document.getElementById(p_name).remove();
    }
    else if (p_name == "icons") {
        var icons = ["aboutme",,"skills","projects","contactme","terminal"]
        for (let icon in icons) document.getElementById(icons[icon]).remove();
    }
    else if (p_name == "bash") {
        hideWindow("terminalbox");
        document.getElementById('terminalcontent').innerHTML = '<pre id="term-contents">~$ <span class="cursor"></span></pre>';
        start();
    }
    else {
        if (p_name == "spaceshooter" || p_name == "snake") closeWindow(p_name);
        else hideWindow(get_process_name(process_id));
    }
    delete processes[process_id];
}

function get_process_name(process_id) {
    return processes[process_id][4];
}

function define_bash_as_opened() {bash_open = true;}
function define_bash_as_closed() {bash_open = false;}

window.addEventListener("load", start);

function cowsay_say(text) {
    var cow = "\r\n        \\   ^__^\r\n         \\  (oo)\\_______\r\n            (__)\\       )\\/\\\r\n                ||----w |\r\n                ||     ||";
    return cowsay_ballon_say(text, 20) + cow;
}

function cowsay_ballon_say(text, wrap) {
    var delimiters = {
        first: ["/", "\\"],
        middle: ["|", "|"],
        last: ["\\", "/"],
        only: ["<", ">"]
    };

    return cowsay_format(text, wrap, delimiters);
}

function cowsay_format(text, wrap, delimiters) {
    var lines = cowsay_split(text, wrap);
    var maxLength = cowsay_max(lines);

    var balloon;
    if (lines.length === 1) {
        balloon = [
            " " + cowsay_top(maxLength),
            delimiters.only[0] + " " + lines[0] + " " + delimiters.only[1],
            " " + cowsay_bottom(maxLength)
        ];
    } else {
        balloon = [" " + cowsay_top(maxLength)];

        for (var i = 0, len = lines.length; i < len; i += 1) {
            var delimiter;

            if (i === 0) {
                delimiter = delimiters.first;
            } else if (i === len - 1) {
                delimiter = delimiters.last;
            } else {
                delimiter = delimiters.middle;
            }

            balloon.push(delimiter[0] + " " + cowsay_pad(lines[i], maxLength) + " " + delimiter[1]);
        }

        balloon.push(" " + cowsay_bottom(maxLength));
    }

    return balloon.join("\n");
}

function cowsay_split(text, wrap) {
    text = text.replace(/\r\n?|[\n\u2028\u2029]/g, "\n").replace(/^\uFEFF/, '');

    var lines = [];
    if (!wrap) {
        lines = text.split("\n");
    } else {
        var start = 0;
        while (start < text.length) {
            var nextNewLine = text.indexOf("\n", start);

            var wrapAt = Math.min(start + wrap, nextNewLine === -1 ? text.length : nextNewLine);

            lines.push(text.substring(start, wrapAt));
            start = wrapAt;

            if (text.charAt(start) === "\n") {
                start += 1;
            }
        }
    }

    return lines;
}

function cowsay_max(lines) {
    var max = 0;
    for (var i = 0, len = lines.length; i < len; i += 1) {
        if (lines[i].length > max) {
            max = lines[i].length;
        }
    }

    return max;
}


function cowsay_pad(text, length) {
    return text + (new Array(length - text.length + 1)).join(" ");
}

function cowsay_top(length) {
    return new Array(length + 3).join("_");
}

function cowsay_bottom(length) {
    return new Array(length + 3).join("-");
}


function start() {

    var term = document.getElementById("term-contents");
    var termContainer = term.parentElement;

    term.innerText += "";
    let cursor = document.createElement("span");
    cursor.className = "cursor";
    term.appendChild(cursor);

    var cmd_buffer = "";

    function handle_enter() {
        output_html(document.createElement("br"));
        if (cmd_buffer.length !== 0) {
            handle_cmd(cmd_buffer);
        }
        cmd_buffer = "";
        stop_flag = false;
        print_output("~"+ current_directory +"$ ");
    }

    function handle_char(key) {
        print_output(key);
        cmd_buffer += key;
    }

    function print_output(text) {
        output_html(document.createTextNode(text));
    }

    function output_html(node) {
        term.insertBefore(node, cursor);
        termContainer.scrollTop = termContainer.scrollHeight - termContainer.clientHeight;
    }

    for (var link of document.getElementsByClassName("text-link")) {
        link.addEventListener("click", function(evt) {
            evt.target.blur();
            for (var char of evt.target.dataset.text) {
                handle_char(char);
            }
            handle_enter();
        });
    }

    window.addEventListener("paste", function(evt) {
        if (!bash_open) {
            evt.preventDefault();
            let paste = (evt.clipboardData || window.clipboardData).getData('text');

            for (var char of paste) {
                handle_char(char);
            }
        }
    })

    window.addEventListener("keydown", function(evt) {
        if (!bash_open || evt.isComposing || evt.keyCode === 229) {
            return;
        }
        evt.target.focus();

        if (evt.key.length === 1) {
            if (evt.altKey === false && evt.ctrlKey === false && evt.metaKey === false) {
                handle_char(evt.key);
            } else if (evt.altKey === false && evt.ctrlKey === true && evt.metaKey === false && evt.key === "c") {
                print_output("^C\n~$ ");
                cmd_buffer = "";
                stop_flag = true;
            }
        } else if (evt.key === "Backspace") {
            if (cmd_buffer.length !== 0) {
                cmd_buffer = cmd_buffer.slice(0, -1);
                term.removeChild(cursor.previousSibling);
            }
        } else if (evt.key === "Tab" && bash_open) {
            tab_complete(cmd_buffer);
            evt.preventDefault();
        } else if (evt.key === "Enter" && bash_open) {
            handle_enter()
        }
    });

    function split_cmd(cmd) {
        var out = [];
        var cmd_parts = [...cmd.matchAll(/((?:[^ \\]*\\.)+[^ ]*)|"([^"]+)"|'([^']+)'|([^ ]+)/g)];
        for (var part of cmd_parts) {
            var processed_part;
            if (typeof part[1] !== "undefined") {
                processed_part = part[1].replace(/(^|[^\\])\\ (?!\\)/g, "$1 ").replace("\\\\", "\\");
            } else if (typeof part[2] !== "undefined") {
                processed_part = part[2].replace(/^"(.*)"$/g, "$1");
            } else if (typeof part[3] !== "undefined") {
                processed_part = part[3].replace(/^'(.*)'$/g, "$1");
            } else if (typeof part[4] !== "undefined") {
                processed_part = part[4];
            }
            out.push(
                processed_part
                .replace(/(^|[^\\])\\n(?!\\)/g, "$1\n")
                .replace(/(^|[^\\])\\t(?!\\)/g, "$1\t")
            )
        }
        return out
    }

    var COMMANDS = {
        "pwd": {
            "cmd": cmd_pwd,
            "complete": null,
        },
        "ls": {
            "cmd": cmd_ls,
            "complete": null,
        },
        "help": {
            "cmd": cmd_help,
            "complete": null,
        },
        "echo": {
            "cmd": cmd_echo,
            "complete": null,
        },
        "cowsay": {
            "cmd": cmd_cowsay,
            "complete": null,
        },
        "cat": {
            "cmd": cmd_cat,
            "complete": complete_cat,
        },
        "cd": {
            "cmd": cmd_cd,
            "complete": complete_cd,
        },
        "rm": {
            "cmd": cmd_rm,
            "complete": complete_cat,
        },
        "ps": {
            "cmd": cmd_ps,
            "complete": null,
        },
        "kill": {
            "cmd": cmd_kill,
            "complete": null,
        },
        "clear": {
            "cmd": cmd_clear,
            "complete": null,
        },
    };

    var HIDEN_COMMANDS = {
        "./snake.exe": {
            "cmd": cmd_snake,
            "complete": null,
        },
        "./goose.exe": {
            "cmd": cmd_goose,
            "complete": null,
        },
        "./virus.exe": {
            "cmd": cmd_virus,
            "complete": null,
        },
        "sl": {
            "cmd": cmd_sl,
            "complete": null,
        },
        "yes": {
            "cmd": cmd_yes,
            "complete": null,
        },
    };

    function tab_complete(cmd) {
        var cmd_parts = split_cmd(cmd);
        if (cmd.substr(cmd.length - 1) === " ") {
            cmd_parts.push("");
        }
        if (cmd_parts.length === 1) {
            tab_complete_from_list(cmd_parts[0], Object.keys(COMMANDS), cmd);
        } else {
            if (COMMANDS[cmd_parts[0]] && COMMANDS[cmd_parts[0]]["complete"]) {
                var complete = COMMANDS[cmd_parts[0]]["complete"](cmd_parts.slice(1));
                if (complete) {
                    tab_complete_from_list(cmd_parts[cmd_parts.length - 1], complete, cmd);
                }
            }
        }
    }

    function tab_complete_from_list(cmd_part, options, cmd) {
        var similar_matches = options.filter(function(k) {
            return k.startsWith(cmd_part);
        });
        for (var key of options) {
            if (key.startsWith(cmd_part) && (cmd_part !== key || similar_matches.length === 1)) {
                if (similar_matches.length === 1) {
                    for (var char of key.substring(cmd_part.length)) {
                        handle_char(char);
                    }
                    handle_char(" ");
                } else {
                    var orig_len = similar_matches.length;
                    var similar_match = cmd_part;
                    var i = cmd_part.length;
                    while (true) {
                        console.log(similar_match);
                        if (!key[i]) {
                            break;
                        }
                        similar_match += key[i];
                        var new_similar_matches = options.filter(function(k) {
                            return k.startsWith(similar_match);
                        });
                        if (new_similar_matches.length !== orig_len) {
                            similar_match = similar_match.substring(0, similar_match.length - 1);
                            break;
                        }
                        i += 1;
                    }
                    print_output("\nOptions:\n" + similar_matches.join("\t") + "\n~$ ");
                    for (var char of cmd) {
                        print_output(char);
                    }
                    for (var char of similar_match.substring(cmd_part.length)) {
                        handle_char(char);
                    }
                }
                return;
            }
        }
    }

    function handle_cmd(cmd) {
        var cmd_parts = split_cmd(cmd);
        if (COMMANDS[cmd_parts[0]]) {
            COMMANDS[cmd_parts[0]]["cmd"](cmd_parts.slice(1));
        }
        else if (HIDEN_COMMANDS[cmd_parts[0]]) {
            HIDEN_COMMANDS[cmd_parts[0]]["cmd"](cmd_parts.slice(1));
        } else {
            print_output("Unknown command\n");
        }
    }

    function cmd_pwd() {
        var link = document.createElement("a");
        link.innerText = "https://miquelt9.github.io\n";
        link.href = "https://miquelt9.github.io";
        link.tabIndex = -1;
        output_html(link);
    }

    function cmd_help() {
        print_output("Available commands:\n" + Object.keys(COMMANDS).join("\t") + "\n");
    }

    function cmd_echo(args) {
        print_output(args.join(" ") + "\n");
    }

    async function cmd_yes(args) {
        if (args.length === 0) {
            print_output("Usage: yes [message]\n");
            return;
        }

        populate_process("yes");
        while(true) { 
            print_output(args.join(" ") + "\n");
            await delay(15);
            if (stop_flag) break;
        }
        stop_flag = false;
        kill_process_named("yes");
    }

    function cmd_cowsay(args) {
        if (args.length === 0) {
            print_output("Usage: cowsay [message]\n");
            return;
        }
        print_output(cowsay_say(args.join(" ")) + "\n");
    }

    var FILES = {};
    var HIDEN_FILES = {};

    var link = document.createElement("a");
    link.innerText = "miqueltorner9@gmail.com\n";
    link.href = "mailto:miqueltorner9@gmail.com";
    link.target = "_blank";
    link.tabIndex = -1;
    FILES["email"] = link;

    var link = document.createElement("a");
    link.innerText = "Miquel_Torner_CV.pdf\n";
    link.href = "./docs/Miquel_Torner_CV.pdf";
    link.target = "_blank";
    link.tabIndex = -1;
    FILES["cv"] = link;

    var link = document.createElement("a");
    link.innerText = "miquelt9.github.io/portfolio/\n";
    link.href = "https://miquelt9.github.io/portfolio/";
    link.target = "_blank";
    link.tabIndex = -1;
    FILES["portfolio"] = link;

    var link = document.createElement("a");
    link.innerText = "miquelt9.github.io/portfolio/posts\n";
    link.href = "https://miquelt9.github.io/portfolio/posts";
    link.target = "_blank";
    link.tabIndex = -1;
    FILES["posts"] = link;

    var link = document.createElement("a");
    link.innerText = "github.com/miquelt9\n";
    link.href = "https://github.com/miquelt9";
    link.target = "_blank";
    link.tabIndex = -1;
    FILES["github"] = link;

    var link = document.createElement("a");
    link.innerText = "linkedin.com/in/miqueltv/\n";
    link.href = "https://www.linkedin.com/in/miqueltv/";
    link.target = "_blank";
    link.tabIndex = -1;
    FILES["linkedin"] = link;

    var link = document.createElement("a");
    link.innerText = "devpost.com/miqueltorner9\n";
    link.href = "https://www.devpost.com/miqueltorner9";
    link.target = "_blank";
    link.tabIndex = -1;
    FILES["devpost"] = link;

    var secret_link = document.createElement("a");
    HIDEN_FILES["."] = secret_link

    var secret_link = document.createElement("a");
    HIDEN_FILES[".."] = secret_link

    var secret_link = document.createElement("a");
    HIDEN_FILES["snake.exe"] = secret_link

    var secret_link = document.createElement("a");
    HIDEN_FILES["goose.exe"] = secret_link



    var about = document.createElement("div");

    var p = document.createElement("p");
    p.innerText = "Hi I’m Miquel!";
    about.appendChild(p);

    var img = document.createElement("img")
    img.src = "images/photoOfMe.png";
    img.style.width = "100px";
    about.appendChild(img);

    p = document.createElement("p");
    p.innerText = "Things to about me!:";
    about.appendChild(p);

    var ul = document.createElement("ul");
    var li = document.createElement("li")
    li.innerText = "Informatics Engineering graduate from Barcelona School of Informatics (FIB), UPC";
    ul.appendChild(li);
    li = document.createElement("li")
    li.innerText = "A part from programming, I love cooking and hiking!";
    ul.appendChild(li);
    about.appendChild(ul)

    p = document.createElement("p");
    p.innerText = "Supported locales:";
    about.appendChild(p);

    ul = document.createElement("ul");
    li = document.createElement("li")
    li.innerText = "English";
    ul.appendChild(li);
    li = document.createElement("li")
    li.innerText = "Catalan";
    ul.appendChild(li);
    li = document.createElement("li")
    li.innerText = "Spanish";
    ul.appendChild(li);
    about.appendChild(ul);
    FILES["about"] = about;

    function cmd_ls(args) {
        if (args.length < 1) {
            print_output(Object.keys(FILES).join("\t") + "\n");
        }
        else if (args.length == 1 && (args[0] == "-a" || args[0] == "-la")) {
            print_output(Object.keys(HIDEN_FILES).join("\t") + "\n" + Object.keys(FILES).join("\t") + "\n");
        }
        else {
            print_output("Usage: ls\n");
        }
    }

    async function cmd_sl(args) {
        if (args.length > 0) print_output("Unknown command\n");
        else {
            populate_process("sl");    
            for (let i = 80; i > -82; --i) { // TODO: Use the window size xd
                print_output("\n\n\n\n\n\n\n")
                print_output(getTrainSmoke(Math.abs(i)%4, i+4));             
                print_output(getTrainBody(i));
                if (i >= 0) print_output(getTrainWheels(i%6, i-2));
                else print_output(getTrainWheels(5+(i%6), i-2));
                if (i < 3) print_output("\n");
                await delay(80);
                if (stop_flag) break;
            }
            stop_flag = false;
            kill_process_named("sl");
            document.getElementById('terminalcontent').innerHTML = '<pre id="term-contents">~$ <span class="cursor"></span></pre>';
            start();
        }
    }
    
    function cmd_cat(args) {
        for (var arg of args) {
            if (FILES[arg]) {
                output_html(FILES[arg])
            } else {
                print_output("cat: No such file\n");
                return;
            }
        }
    }

    function complete_cat() {
        return Object.keys(FILES);
    }

    var LINKS = {
        "github": "https://github.com/miquelt9",
        "linkedin": "https://www.linkedin.com/in/miqueltv/",
        "devpost": "https://devpost.com/miqueltorner9",
        "cv": "./docs/Miquel_Torner_CV.pdf",
        "portfolio": "https://miquelt9.github.io/portfolio/",
        "posts": "https://miquelt9.github.io/portfolio/posts",
    }

    function cmd_cd(args) {
        if (args.length !== 1) {
            print_output("Usage: cd [dir]\n");
        } else {
            if (LINKS[args[0]]) {
                print_output("Navigating to " + LINKS[args[0]] + "\n");
                window.open(LINKS[args[0]], '_blank');
            } else if (args[0] == '.') {
                
            } else {
                print_output("cd: No such directory\n");
            }
        }
    }

    function cmd_snake(args) {
        if (args.length !== 0) {
            print_output("Invalid argument\n");
        } else {
            print_output("Starting game...\n");
            openWindow("snake");
        }
    }

    function cmd_goose(args) {
        if (args.length !== 0) {
            print_output("Invalid argument\n");
        } else {
            print_output("Goose mode is still being develop...\n");
            showGoose('goose1')
        }
    }

    function cmd_virus(args) {
        if (args.length !== 0) {
            print_output("Invalid argument\n");
        } else {
            define_bash_as_closed();
            ghostMouseMove();
            var delay = 5000;
            const msg = "always wondered why people never use their strongest attack first.";
            for (let i = 0; i < msg.length; i++) {
                delay += 60;
                setTimeout(function() {print_output(msg[i])}, delay);
            }
            setTimeout(function() {print_output("\n~$ ")}, delay+300);           
            setTimeout(function() {define_bash_as_opened()}, delay+4000);           
        }
    }

    function complete_cd(args) {
        if (args.length < 2) {
            return Object.keys(LINKS);
        } else {
            return [];
        }
    }

    async function cmd_rm(args) {
        if (args.length < 1) {
            print_output("Usage: rm [file]\n");
        } else {
            if (args[0] === "*") {
                FILES = {};
            }
            else if (args[0] !== "." && args[0] !== ".." && args[0] !== "-rf") {
                if (FILES.hasOwnProperty(args[0])) delete FILES[args[0]];
                else print_output("rm: cannot remove " + args[0] +": no such file or directory\n");
            } else {
                if (args[1] === "/" || args[1] === "./" || args[1] === "~/"  || args[1] === "~" ) {

                    var audio = new Audio('/sounds/error_sound.mp3');
                    //var audio = new Audio('https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3');
                    print_output("Ooops!\n");
                    await delay(200);
                    
                    for (let i = 0; i < 3; i++) { 
                        createErrorBox(getRandomInt(1, 80), getRandomInt(5, 85));
                        //audio.play();
                        await delay(getRandomInt(750, 1500));
                    }
                    for (let i = 0; i < 10; i++) { 
                        createErrorBox(getRandomInt(1, 80), getRandomInt(5, 85));
                        await delay(getRandomInt(200, 300));
                    }
                    for (let i = 0; i < 20; i++) { 
                        createErrorBox(getRandomInt(1, 80), getRandomInt(5, 85));
                        await delay(getRandomInt(100, 150));
                    }
                    for (let i = 0; i < 50; i++) { 
                        createErrorBox(getRandomInt(1, 80), getRandomInt(5, 85));
                        await delay(getRandomInt(40, 80));
                    }
                    for (let i = 0; i < 150; i++) { 
                        createErrorBox(getRandomInt(1, 80), getRandomInt(5, 85));
                        await delay(getRandomInt(10, 30));
                    }

                    for (let i = 0; i < 7; i++) { 
                        var x_off = getRandomInt(0,1), x = getRandomInt(1, 80);
                        var y_off = getRandomInt(0,1), y = getRandomInt(5, 85);
                        if (x_off == 0) x_off = -1;
                        if (y_off == 0) y_off = -1;
                        var it = getRandomInt(50, 150);
                        for (let i = 0; i < it; i++) { 
                            if (y < 5 || y > 85) y_off *= -1;
                            if (x < 1 || x > 80) x_off *= -1;
                            createErrorBox(x, y);
                            await delay(getRandomInt(5, 20));
                            y += y_off*1.5;
                            x += x_off;
                        }
                    }
                    
                    await delay(700);

                    createBlueWindow();
                    
                    
                } else {
                    print_output("rm: Cannot be removed\n");
                }
            }
        }
    }

    function cmd_ps(args) {
        if (args.length <= 1) {
            populate_process("ps");
            // print_output();
            print_output("PID\tTTY\tTIME\t\tCMD\n");
            for (let id in processes) {
                const process = processes[id];
                const p_name = get_process_name(id);
                if ((p_name != "desktop" && p_name != "startmenu" && p_name != "taskbar" && p_name != "clock" && p_name != "icons") || args.includes("-e")) {
                    for (let value in process) {
                        if (value == 0 || value == 2 || value == 4) {
                            print_output(process[value] + "\t");
                        }
                        else if (value == 3) {
                            const elapsed_time = new Date() - process[value];
                            const time = new Date(elapsed_time).toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' });
                            print_output(time + "\t");
                        }                    
                    }
                    print_output("\n");
                }
            }
            kill_process_named("ps");
        }
        else {
            print_output("Usage: ps\n");
        }
    }

    function cmd_kill(args) {
        if (args.length == 1) {
            if (processes.hasOwnProperty(args[0])) {
                    kill_process_id(args[0]);
                    print_output("Process " + args[0] + " terminated\n");
            }
            else {
                print_output("Process " + args[0] + " was not found\n");
            }
        }
        else {
            print_output("Usage: kill [id]\n");
        }
    }

    function cmd_clear(args) {
        if (args.length !== 0) {
            print_output("Usage: clear\n");
        } else {
            document.getElementById('terminalcontent').innerHTML = '<pre id="term-contents">~$ <span class="cursor"></span></pre>';
            start();
        }
    }

}

errorBoxContent =   '<div class="topbar" id="mainboxheader">SystemError'+
                    '<div class="buttons"><div class="topbarButton">_</div>'+
                    '<div class="topbarButton">□</div>'+
                    '<div class="topbarButton"">X</div></div></div>	'+
                    '<div class="content">An unexpected error ocurred!</div>';


function createErrorBox(x, y) {
    var elem = document.createElement('div');
    elem.style.cssText = 'position: absolute; background-color: #EEF2F5; padding: 4px; border-bottom: solid 2px #808080; border-right: solid 2px #808080; border-top: solid 2px #FEFFFF; border-left: solid 2px #FEFFFF; box-shadow: 2px 2px #010101; min-width: 18%; min-height: 13%; z-index: 100;';
    elem.style.left = x + "vw";
    elem.style.bottom = y + "vh";

    elem.innerHTML += errorBoxContent;
    
    document.body.appendChild(elem);
}


function createBlueWindow() {
    var elem = document.createElement('div');

    var content = document.createTextNode("Error 404: PC not found.");
    elem.style.background = "#357EC7";
    elem.style.color = "white";
    elem.style.fontSize = "2vmax";
    elem.style.width = "100vw";
    elem.style.height = "100vh";
    elem.style.padding = "2vmax"
    elem.appendChild(content);

    document.body.innerHTML = "";
    document.body.style.background = "#357EC7";
    document.body.style.overflow = "hidden";
    document.body.appendChild(elem);

    setTimeout(function() {
        window.location.replace("https://miquelt9.github.io/404");
    }, 2500);
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
