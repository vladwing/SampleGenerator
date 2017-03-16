#!/usr/bin/env node
'use strict';

require('./bootstrap.js');

const imports = {
    'mysql': require('mysql'),
    'express': require('express'),
    'App': require(__commonPath + '/lib/App.class.js'),
    'RecurrentJob': require(__commonPath + '/lib/RecurrentJob.class.js'),
    'OutputDriver': require(__commonPath + '/lib/OutputDriver.class.js'),
    'SampleGenerator': require(__commonPath + '/lib/SampleGenerator.class.js'),
    'SampleDefinition': require(__commonPath + '/lib/SampleDefinition.class.js'),
};

module.exports = class SampleGeneratorApp extends imports.App{

    constructor(args) {
        super(args);

        this.serviceReady = false;

        this.config.loadFromJs(__commonPath + '/resources/configs/config.js');

        this.initWeb();
        this.initSqlClient();
        this.initDriver();
        this.initSampleGenerator();
        this.initRecurrentJob();
    }
    initWeb() {
        this.webApp = imports.express();
        this.webApp.set('views', __commonPath + '/resources/views');
        this.webApp.set('view engine', 'twig');

        this.webApp.set('twig options', {
            strict_variables: true
        });

        // init routes
        require(__commonPath + '/resources/routing/routing.js')(this);
    }

    initSqlClient() {
        this.sqlClient = imports.mysql;
    }

    initDriver() {
        this.logger.info("Creating output driver");
        this.driver = new imports.OutputDriver({
            tableName: this.config.getParameter('outputDriver.tableName'),
            fieldMapper: this.config.getParameter('outputDriver.fieldMapper'),
            client: this.sqlClient,
            dbConfig: {
                'host': this.config.getParameter('db.host') || 'localhost',
                'port': this.config.getParameter('db.port') || 3306,
                'user': this.config.getParameter('db.user'),
                'password': this.config.getParameter('db.password'),
                'database': this.config.getParameter('db.database'),
            }
        });
    }

    initSampleGenerator() {
        this.logger.info("Creating sample definitions");
        let id = 1;
        this.sampleDefinitions = this.config.getParameter('definitions').map((x) => new imports.SampleDefinition(id++, x));
        this.logger.info("Creating sample generator");
        this.sampleGenerator = new imports.SampleGenerator({
            definitions: this.sampleDefinitions,
            driver: this.driver,
        });
    }

    initRecurrentJob() {
        let sampleGenerator = this.sampleGenerator;
        let driver = this.driver;
        this.sampleGeneratorJob = new imports.RecurrentJob({
            name: 'Sample generator job',
            interval: this.config.getParameter('jobInterval'),
            handler: function() {
                let boundOnSampleGenerate = () => {
                    this.runFinished();
                    sampleGenerator.removeListener('error', boundOnSampleGenerate);
                    sampleGenerator.removeListener('finished', boundOnSampleGenerate);
                };
                sampleGenerator.on('error', boundOnSampleGenerate);
                sampleGenerator.on('finished', boundOnSampleGenerate);

                sampleGenerator.generateSamples((err, result) => {
                    if (err) {
                        this.logger.error('Sample Generator error:', err);
                        return sampleGenerator.emit('error', err);
                    }
                    return sampleGenerator.emit('finished');
                });
            }
        });
    }

    start() {
        this.sampleGeneratorJob.start();
        this.serviceReady = true;
        let port = this.config.getParameter('app.port');
        this.logger.info('Starting API on port', port);
        let server = this.webApp.listen(port, '0.0.0.0');
        server.on('error', (e) => {
            if (e.code === 'EADDRINUSE') {
                this.logger.error("Another service is already using this port:", e);
            } else {
                this.logger.error("HTTP server unexpected error:", e);
            }
            throw e;
        });
    }
};

if (require.main === module) {
    let app = new module.exports();
    app.start();
}
