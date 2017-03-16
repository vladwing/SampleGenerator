'use strict';

let imports = {
    'BaseObject': require(__commonPath + '/lib/BaseObject.class.js'),
};

module.exports = class Controller extends imports.BaseObject {
    setApp(app) {
        this.app = app;
    }
};
