'use strict';

const imports = {
    "EventEmitter" : require('events'),
    "LoggerNull": require(__commonPath + '/lib/LoggerNull.class.js'),
};

module.exports = class BaseObject extends imports.EventEmitter {
    constructor() {
        super();

        if (this.constructor === BaseObject) {
            throw Error('BaseObject is an abstract class');
        }
        // initialize the main logger
        if (!BaseObject.logger) {
            BaseObject.logger = new imports.LoggerNull();
        }
    }

    get logger() { return BaseObject._logger; }
    static set logger(logger) { this._logger = logger; }
    static get logger() { return this._logger; }

    emit() {
        super.emit.apply(this, arguments);
    }

    trace(...args) {
        return this.logger["trace"](...args);
    }

    debug(...args) {
        return this.logger["debug"](...args);
    }

    info(...args) {
        return this.logger["info"](...args);
    }

    warn(...args) {
        return this.logger["warn"](...args);
    }

    error(...args) {
        return this.logger["error"](...args);
    }
};
