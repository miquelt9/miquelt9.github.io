var current_directory = "";

var stop_flag = false;
var bash_open = false;
var processes = window.ProcessRegistry.processes;
window.ProcessRegistry.populateProcess("bash");
window.ProcessRegistry.populateProcess("desktop", "root");
window.ProcessRegistry.populateProcess("taskbar", "root");
window.ProcessRegistry.populateProcess("startmenu", "root");
window.ProcessRegistry.populateProcess("clock", "root");
window.ProcessRegistry.populateProcess("icons", "root");

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
    var cmd_char_nodes = [];
    var cmd_cursor_index = 0;
    var snakeSession = null;
    var snakeFrameNode = null;
    var snakeInputEnabled = false;
    var cmd_history = [];
    var cmd_history_index = -1;

    function replace_cmd_buffer(new_buffer) {
        for (var i = 0; i < cmd_char_nodes.length; i++) {
            if (cmd_char_nodes[i].parentNode === term) {
                term.removeChild(cmd_char_nodes[i]);
            }
        }
        cmd_buffer = "";
        cmd_char_nodes = [];
        cmd_cursor_index = 0;
        for (var char of new_buffer) {
            handle_char(char);
        }
    }

    function handle_enter() {
        move_cursor_to_end();
        output_html(document.createElement("br"));
        if (cmd_buffer.length !== 0) {
            if (cmd_history.length === 0 || cmd_history[cmd_history.length - 1] !== cmd_buffer) {
                cmd_history.push(cmd_buffer);
            }
            handle_cmd(cmd_buffer);
        }
        cmd_buffer = "";
        cmd_char_nodes = [];
        cmd_cursor_index = 0;
        cmd_history_index = cmd_history.length;
        stop_flag = false;
        print_output("~"+ current_directory +"$ ");
    }

    function handle_char(key) {
        var charNode = document.createTextNode(key);
        if (cmd_cursor_index >= cmd_char_nodes.length) {
            term.insertBefore(charNode, cursor);
        } else {
            term.insertBefore(charNode, cmd_char_nodes[cmd_cursor_index]);
        }
        cmd_char_nodes.splice(cmd_cursor_index, 0, charNode);
        cmd_buffer = cmd_buffer.slice(0, cmd_cursor_index) + key + cmd_buffer.slice(cmd_cursor_index);
        cmd_cursor_index += 1;
        termContainer.scrollTop = termContainer.scrollHeight - termContainer.clientHeight;
    }

    function browse_history(direction) {
        if (cmd_history.length === 0) {
            return;
        }
        cmd_history_index = Math.max(0, Math.min(cmd_history.length, cmd_history_index + direction));
        if (cmd_history_index === cmd_history.length) {
            replace_cmd_buffer("");
            return;
        }
        replace_cmd_buffer(cmd_history[cmd_history_index]);
        move_cursor_to_end();
    }

    function print_output(text) {
        output_html(document.createTextNode(text));
    }

    function output_html(node) {
        term.insertBefore(node, cursor);
        termContainer.scrollTop = termContainer.scrollHeight - termContainer.clientHeight;
    }

    function move_cursor_to_end() {
        term.appendChild(cursor);
        cmd_cursor_index = cmd_char_nodes.length;
    }

    function move_cursor_left() {
        if (cmd_cursor_index === 0) {
            return;
        }
        term.insertBefore(cursor, cmd_char_nodes[cmd_cursor_index - 1]);
        cmd_cursor_index -= 1;
    }

    function move_cursor_right() {
        if (cmd_cursor_index >= cmd_char_nodes.length) {
            return;
        }
        var anchor = cmd_char_nodes[cmd_cursor_index];
        term.insertBefore(cursor, anchor.nextSibling);
        cmd_cursor_index += 1;
    }

    function remove_char_before_cursor() {
        if (cmd_cursor_index === 0) {
            return;
        }
        var removeIndex = cmd_cursor_index - 1;
        var node = cmd_char_nodes[removeIndex];
        if (node.parentNode === term) {
            term.removeChild(node);
        }
        cmd_char_nodes.splice(removeIndex, 1);
        cmd_buffer = cmd_buffer.slice(0, removeIndex) + cmd_buffer.slice(removeIndex + 1);
        cmd_cursor_index -= 1;
    }

    function setSnakeDirectionFromKey(key) {
        if (!snakeSession || !snakeSession.game) {
            return false;
        }
        if (key === "ArrowUp" || key === "w" || key === "W") {
            snakeSession.game.setDirection(0, -1);
            return true;
        }
        if (key === "ArrowDown" || key === "s" || key === "S") {
            snakeSession.game.setDirection(0, 1);
            return true;
        }
        if (key === "ArrowLeft" || key === "a" || key === "A") {
            snakeSession.game.setDirection(-1, 0);
            return true;
        }
        if (key === "ArrowRight" || key === "d" || key === "D") {
            snakeSession.game.setDirection(1, 0);
            return true;
        }
        return false;
    }

    function stopTerminalSnakeGame() {
        if (!snakeSession || !snakeSession.game) {
            return;
        }
        snakeSession.game.stop();
        snakeInputEnabled = false;
    }
    window.stopTerminalSnakeGame = stopTerminalSnakeGame;

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

        if (snakeInputEnabled) {
            if (evt.altKey === false && evt.ctrlKey === true && evt.metaKey === false && evt.key === "c") {
                move_cursor_to_end();
                print_output("^C\n~$ ");
                cmd_buffer = "";
                cmd_char_nodes = [];
                cmd_cursor_index = 0;
                stop_flag = true;
                stopTerminalSnakeGame();
                evt.preventDefault();
                return;
            }

            if (setSnakeDirectionFromKey(evt.key)) {
                evt.preventDefault();
                return;
            }

            evt.preventDefault();
            return;
        }

        if (evt.key.length === 1) {
            if (evt.altKey === false && evt.ctrlKey === false && evt.metaKey === false) {
                evt.preventDefault();
                handle_char(evt.key);
                evt.preventDefault();
            } else if (evt.altKey === false && evt.ctrlKey === true && evt.metaKey === false && evt.key === "c") {
                evt.preventDefault();
                move_cursor_to_end();
                print_output("^C\n~$ ");
                cmd_buffer = "";
                cmd_char_nodes = [];
                cmd_cursor_index = 0;
                stop_flag = true;
                cmd_history_index = cmd_history.length;
            }
        } else if (evt.key === "Backspace") {
            if (cmd_cursor_index !== 0) {
                evt.preventDefault();
                remove_char_before_cursor();
            }
            evt.preventDefault();
        } else if (evt.key === "ArrowUp") {
            browse_history(-1);
            evt.preventDefault();
        } else if (evt.key === "ArrowDown") {
            browse_history(1);
            evt.preventDefault();
        } else if (evt.key === "Tab" && bash_open) {
            tab_complete(cmd_buffer);
            evt.preventDefault();
        } else if (evt.key === "Enter" && bash_open) {
            handle_enter();
            evt.preventDefault();
        } else if (evt.key === "ArrowLeft") {
            evt.preventDefault();
            move_cursor_left();
        } else if (evt.key === "ArrowRight") {
            evt.preventDefault();
            move_cursor_right();
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
        "history": {
            "cmd": cmd_history_cmd,
            "complete": null,
        },
    };

    var HIDEN_COMMANDS = {
        "./snake.sh": {
            "cmd": cmd_snake,
            "complete": null,
        },
        "./goose.sh": {
            "cmd": cmd_goose,
            "complete": null,
        },
        "./virus.sh": {
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
                    move_cursor_to_end();
                    print_output("\nOptions:\n" + similar_matches.join("\t") + "\n~$ ");
                    replace_cmd_buffer(similar_match);
                }
                return;
            }
        }
    }

    function handle_cmd(cmd) {
        var cmd_parts = split_cmd(cmd);
        if (cmd_parts.length === 0) {
            return;
        }
        if (COMMANDS[cmd_parts[0]]) {
            COMMANDS[cmd_parts[0]]["cmd"](cmd_parts.slice(1));
        }
        else if (HIDEN_COMMANDS[cmd_parts[0]]) {
            HIDEN_COMMANDS[cmd_parts[0]]["cmd"](cmd_parts.slice(1));
        } else {
            print_output("Unknown command\n");
        }
    }

    function cmd_history_cmd(args) {
        if (args.length !== 0) {
            print_output("Usage: history\n");
            return;
        }
        for (var i = 0; i < cmd_history.length; i++) {
            print_output((i + 1) + "  " + cmd_history[i] + "\n");
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
        print_output("Hidden executables: ./goose.sh ./snake.sh ./virus.sh\n");
    }

    function cmd_echo(args) {
        print_output(args.join(" ") + "\n");
    }

    async function cmd_yes(args) {
        if (args.length === 0) {
            print_output("Usage: yes [message]\n");
            return;
        }

        window.ProcessRegistry.populateProcess("yes");
        while(true) { 
            print_output(args.join(" ") + "\n");
            await window.AppUtils.delay(15);
            if (stop_flag) break;
        }
        stop_flag = false;
        window.ProcessRegistry.killProcessNamed("yes");
    }

    function cmd_cowsay(args) {
        if (args.length === 0) {
            print_output("Usage: cowsay [message]\n");
            return;
        }
        print_output(cowsay_say(args.join(" ")) + "\n");
    }

    var terminalData = window.TerminalContentData.buildTerminalContent();
    var FILES = terminalData.files;
    var HIDEN_FILES = terminalData.hiddenFiles;

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
            window.ProcessRegistry.populateProcess("sl");
            for (let i = 80; i > -82; --i) { // TODO: Use the window size xd
                print_output("\n\n\n\n\n\n\n")
                print_output(getTrainSmoke(Math.abs(i)%4, i+4));             
                print_output(getTrainBody(i));
                if (i >= 0) print_output(getTrainWheels(i%6, i-2));
                else print_output(getTrainWheels(5+(i%6), i-2));
                if (i < 3) print_output("\n");
                await window.AppUtils.delay(80);
                if (stop_flag) break;
            }
            stop_flag = false;
            window.ProcessRegistry.killProcessNamed("sl");
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

    var LINKS = terminalData.links;

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

    async function cmd_snake(args) {
        if (args.length !== 0) {
            print_output("Invalid argument\n");
        } else if (snakeSession && snakeSession.game && snakeSession.game.isRunning()) {
            print_output("Snake is already running\n");
        } else {
            print_output("Starting terminal snake...\n");
            snakeFrameNode = document.createElement("pre");
            snakeFrameNode.className = "snake-terminal-frame";
            output_html(snakeFrameNode);

            snakeInputEnabled = true;
            stop_flag = false;
            window.ProcessRegistry.populateProcess("snaketerm");

            var game = window.TerminalSnakeGame.createTerminalSnakeGame({
                width: 20,
                height: 12,
                tickMs: 120,
                onFrame: function onFrame(frame) {
                    if (snakeFrameNode) {
                        snakeFrameNode.textContent = frame;
                    }
                    termContainer.scrollTop = termContainer.scrollHeight - termContainer.clientHeight;
                },
                isBlocked: function isBlocked() {
                    return stop_flag;
                },
            });

            snakeSession = { game: game };
            await game.run();

            snakeInputEnabled = false;
            snakeSession = null;
            snakeFrameNode = null;
            stop_flag = false;
            window.ProcessRegistry.killProcessNamed("snaketerm");
        }
    }

    function cmd_goose(args) {
        if (args.length !== 0) {
            print_output("Invalid argument\n");
        } else {
            print_output("Summoning goose chaos...\n");
            showGoose();
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
                    await window.AppUtils.delay(200);
                    
                    for (let i = 0; i < 3; i++) { 
                        createErrorBox(window.AppUtils.getRandomInt(1, 80), window.AppUtils.getRandomInt(5, 85));
                        await window.AppUtils.delay(window.AppUtils.getRandomInt(750, 1500));
                    }
                    for (let i = 0; i < 10; i++) { 
                        createErrorBox(window.AppUtils.getRandomInt(1, 80), window.AppUtils.getRandomInt(5, 85));
                        await window.AppUtils.delay(window.AppUtils.getRandomInt(200, 300));
                    }
                    for (let i = 0; i < 20; i++) { 
                        createErrorBox(window.AppUtils.getRandomInt(1, 80), window.AppUtils.getRandomInt(5, 85));
                        await window.AppUtils.delay(window.AppUtils.getRandomInt(100, 150));
                    }
                    for (let i = 0; i < 50; i++) { 
                        createErrorBox(window.AppUtils.getRandomInt(1, 80), window.AppUtils.getRandomInt(5, 85));
                        await window.AppUtils.delay(window.AppUtils.getRandomInt(40, 80));
                    }
                    for (let i = 0; i < 150; i++) { 
                        createErrorBox(window.AppUtils.getRandomInt(1, 80), window.AppUtils.getRandomInt(5, 85));
                        await window.AppUtils.delay(window.AppUtils.getRandomInt(10, 30));
                    }

                    for (let i = 0; i < 7; i++) { 
                        var x_off = window.AppUtils.getRandomInt(0,1), x = window.AppUtils.getRandomInt(1, 80);
                        var y_off = window.AppUtils.getRandomInt(0,1), y = window.AppUtils.getRandomInt(5, 85);
                        if (x_off == 0) x_off = -1;
                        if (y_off == 0) y_off = -1;
                        var it = window.AppUtils.getRandomInt(50, 150);
                        for (let i = 0; i < it; i++) { 
                            if (y < 5 || y > 85) y_off *= -1;
                            if (x < 1 || x > 80) x_off *= -1;
                            createErrorBox(x, y);
                            await window.AppUtils.delay(window.AppUtils.getRandomInt(5, 20));
                            y += y_off*1.5;
                            x += x_off;
                        }
                    }
                    
                    await window.AppUtils.delay(700);

                    createBlueWindow();
                    
                    
                } else {
                    print_output("rm: Cannot be removed\n");
                }
            }
        }
    }

    function cmd_ps(args) {
        if (args.length <= 1) {
            window.ProcessRegistry.populateProcess("ps");
            // print_output();
            print_output("PID\tTTY\tTIME\t\tCMD\n");
            for (let id in processes) {
                const process = processes[id];
                const p_name = window.ProcessRegistry.getProcessName(id);
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
            window.ProcessRegistry.killProcessNamed("ps");
        }
        else {
            print_output("Usage: ps\n");
        }
    }

    function cmd_kill(args) {
        if (args.length == 1) {
            if (processes.hasOwnProperty(args[0])) {
                    window.ProcessRegistry.killProcessId(args[0]);
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

// Shared helpers are now provided by window.AppUtils.
