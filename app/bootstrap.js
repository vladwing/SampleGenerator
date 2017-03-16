'use strict';

const imports = {
    "path" : require('path'),
    "fs" : require('fs'),
};

global.__commonPath = imports.fs.realpathSync(imports.path.dirname(__filename) + '/..');
