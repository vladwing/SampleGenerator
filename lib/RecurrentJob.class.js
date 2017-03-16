'use strict';

const imports = {
    'util' : require('util'),
    'uniqid' : require('uniqid'),
    'BaseObject': require(__commonPath + '/lib/BaseObject.class.js'),
};

module.exports = class RecurrentJob extends imports.BaseObject {
    constructor(args) {
        super();
        this.setInterval(args.interval);
        this.name = args.name || imports.uniqid();
        this.setRunHandler(args.handler || null);
        this.runTimeout = null;
    }
    setInterval(interval) {
        interval = parseInt(interval) || 0;
        if (interval <= 0) {
            throw new Error('Invalid interval value; must be strictly positive');
        }
        this.interval = interval;
    }
    setRunHandler(handler) {
        if (!imports.util.isFunction(handler)) {
            throw new Error("Invalid arguments; 'handler' must be callable");
        }
        this.runHandler = handler;
    }
    start(delay) {
        if (this.runTimeout) {
            this.logger.error(`Job ${this.name} is already started`);
            return false;
        }
        delay = parseInt(delay) || 0;
        this.logger.info(`Starting job "${this.name}" in ${delay}ms`);
        this.runTimeout = setTimeout(() => this.run(), delay);
    }
    run() {
        if (this.isRunning) {
            this.logger.info(`Job "${this.name}"" already running`);
            return false;
        }
        this.isRunning = true;
        try {
            let ret = this.runHandler();
            return ret;
        } catch(exception) {
            this.logger.error("Job run exception", exception.message);
            console.log(exception);
        }
        return;
    }

    runFinished(err) {
        if (!this.isRunning) {
            this.logger.error("Job is not running", this.name);
            return false;
        }
        this.isRunning = false;
        this.logger.info("Job finished", this.name);

        this.logger.info("Rescheduling job", this.name, "after", this.interval, "ms");
        this.runTimeout = setTimeout(() => this.run(), this.interval);
    }
};
