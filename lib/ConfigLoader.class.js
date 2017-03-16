'use strict';

let imports = {
    'BaseObject': require(__commonPath + '/lib/BaseObject.class.js'),
};

module.exports = class ConfigLoader extends imports.BaseObject {
    constructor(args) {
        super();

        this.config = {};
    }

    loadFromJs(path) {
        this.logger.info("Loading config from", path);
        this.config = require(path);
    }

    getParameter(key) {
        let container = this.config;
        let parts = key.split(".");
        let value = parts.reduce((o,i)=>o[i], container);
        
        if (value === undefined) {
            return null;
        } else {
            return value;
        }
    }
}
