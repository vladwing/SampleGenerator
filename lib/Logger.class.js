'use strict';

let imports = {
    "stream" : require('stream'),
    "colors": require("colors"),
    "jsonStringifySafe" : require("json-stringify-safe"),
};

module.exports = class Logger {
    constructor(args) {
        this.name = args.name || '';
        if (!this.name) {
            throw new Error('Missing argument "name"');
        }
        this.levelNumbers = {
            "trace": 10,
            "debug": 20,
            "info": 30,
            "warn": 40,
            "error": 50,
        };

        this.enabled = true;

        this.colors = args.colors || {};

        if (args.level) {
            this.setLevel(args.level);
        }
    }
    setLevel(level) {
        this.level = level;
        this.logLevel = this.levelNumbers[level];
    }
    setEnabled(enabled) {
        this.enabled = !!enabled;
    }
    write(level, ...args) {
        if (!this.enabled) {
            return;
        }
        if ((this.levelNumbers[level] || 10) < this.logLevel) {
            return;
        }
        let err = new Error();
        let caller_line = err.stack.split("\n")[3];
        let sp = caller_line.split(":");
        let method = caller_line.split(" ")[5];
        let line = sp[sp.length-2];
        let filePath = sp[sp.length-3].split("/");
        let file = filePath[filePath.length - 1];

        let message = {
            "timestamp" : Math.floor(Date.now() / 1000),
            "level" : level,
            "file" : file,
            "line" : line,
            "method" : method,
            "data" : args,
        };

        let color = this.colors[message.level] || imports.colors.black;

        process.stderr.write(color(imports.jsonStringifySafe(message)) + "\n");
    }

    trace(...args) { return this.write("trace", ...args); }
    debug(...args) { return this.write("debug", ...args); }
    info(...args) { return this.write("info", ...args); }
    warn(...args) { return this.write("warn", ...args); }
    error(...args) { return this.write("error", ...args); }
};
