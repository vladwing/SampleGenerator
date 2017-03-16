'use strict';

let imports = {
    'colors': require('colors'),
    'argv' : require('argv'),
    'BaseObject': require(__commonPath + '/lib/BaseObject.class.js'),
    'ConfigLoader': require(__commonPath + '/lib/ConfigLoader.class.js'),
    'Logger': require(__commonPath + '/lib/Logger.class.js'),
};

module.exports = class App extends imports.BaseObject {
    constructor(args) {
        args = args || {};

        super();

        this.initCli();

        this.initLogger();

        this.initConfig();
    }
    
    initCli() {
        this.argv = imports.argv;

        let options = this.getArgvOptions();
        options.forEach((option) => {
            this.argv.option(option);
        });

        this.args = this.argv.run();
    }

    initLogger() {
        imports.BaseObject.logger = new imports.Logger({
            'name' : 'main',
            'level' : this.args.options['log-level'] || 'trace',
            'colors' : {
                "trace": imports.colors.gray,
                "debug": imports.colors.gray,
                "info": imports.colors.green,
                "warn": imports.colors.yellow,
                "error": imports.colors.red,
            },
        });
        // disable logging if specified
        this.logger.setEnabled(!this.args.options['quiet']);

        this.logger.info("Logger initialized");
    }

    initConfig() {
        this.config = new imports.ConfigLoader();
    }

    getArgvOptions() {
        return [
            {
                name: 'quiet',
                type: 'boolean',
                description: 'Disables logging',
            },
            {
                name: 'log-level',
                type: 'string',
                description: 'Set the desired log level - overwrites config value; Overwrited config value if specified',
            },
        ];
    }
};
