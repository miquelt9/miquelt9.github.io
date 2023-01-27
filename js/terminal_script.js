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
        print_output("> ");
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
        evt.preventDefault();
        let paste = (evt.clipboardData || window.clipboardData).getData('text');

        for (var char of paste) {
            handle_char(char);
        }
    })

    window.addEventListener("keydown", function(evt) {
        if (evt.isComposing || evt.keyCode === 229) {
            return;
        }
        evt.target.focus();

        if (evt.key.length === 1) {
            if (evt.altKey === false && evt.ctrlKey === false && evt.metaKey === false) {
                handle_char(evt.key);
            } else if (evt.altKey === false && evt.ctrlKey === true && evt.metaKey === false && evt.key === "c") {
                print_output("^C\n> ");
                cmd_buffer = "";
            }
        } else if (evt.key === "Backspace") {
            if (cmd_buffer.length !== 0) {
                cmd_buffer = cmd_buffer.slice(0, -1);
                term.removeChild(cursor.previousSibling);
            }
        } else if (evt.key === "Tab") {
            tab_complete(cmd_buffer);
            evt.preventDefault();
        } else if (evt.key === "Enter") {
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
        "lolcat": {
            "cmd": cmd_lolcat,
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
                    print_output("\nOptions:\n" + similar_matches.join("\t") + "\n> ");
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
        } else {
            print_output("Unknown command\n");
        }
    }

    function cmd_pwd() {
        var link = document.createElement("a");
        link.innerText = "https://www.website.com\n";
        link.href = "https://www.website.com";
        link.tabIndex = -1;
        output_html(link);
    }

    function cmd_help() {
        print_output("Available commands:\n" + Object.keys(COMMANDS).join("\t") + "\n");
    }

    function cmd_echo(args) {
        print_output(args.join(" ") + "\n");
    }

    function cmd_lolcat(args) {
        if (args.length === 0) {
            print_output("Usage: lolcat [message]\n");
            return;
        }
        var span = document.createElement("span");
        span.className = "loltext";
        span.innerText = args.join(" ");
        output_html(span);
        print_output("\n");
    }

    function cmd_cowsay(args) {
        if (args.length === 0) {
            print_output("Usage: cowsay [message]\n");
            return;
        }
        print_output(cowsay_say(args.join(" ")) + "\n");
    }

    var FILES = {};

    var link = document.createElement("a");
    link.innerText = "miqueltorner9@gmail.com\n";
    link.href = "mailto:miqueltorner9@gmail.com";
    link.target = "_blank";
    link.tabIndex = -1;
    FILES["email"] = link;

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
    li.innerText = "I'm a Informatics Engineering student at Barcelona School of Informatics (FIB), UPC";
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

    function cmd_ls() {
        print_output(Object.keys(FILES).join("\t") + "\n");
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
    }

    function cmd_cd(args) {
        if (args.length !== 1) {
            print_output("Usage: cd [dir]\n");
        } else {
            if (LINKS[args[0]]) {
                print_output("Navigating to " + LINKS[args[0]] + "\n");
                window.location = LINKS[args[0]];
            } else {
                print_output("cd: No such directory\n");
            }
        }
    }

    function complete_cd(args) {
        if (args.length < 2) {
            return Object.keys(LINKS);
        } else {
            return [];
        }
    }

    function cmd_rm(args) {
        if (args.length < 1) {
            print_output("Usage: rm [file]\n");
        } else {
            if (args[0] !== "-rf") {                        
                print_output("rm: No such file to be removed\n");
            } else {
                if (args[1] === "/" || args[1] === "./") {
                    print_output("Luckly this is not a real terminal\n");
                } else {
                    print_output("rm: Cannot be removed\n");
                }
            }
        }
    }
}