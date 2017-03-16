#!/usr/bin/env node
'use strict';

require('./bootstrap.js');

const imports = {
    'mysql': require('mysql'),
    'App': require(__commonPath + '/lib/App.class.js'),
    'RecurrentJob': require(__commonPath + '/lib/RecurrentJob.class.js'),
    'AlertChecker': require(__commonPath + '/lib/AlertChecker.class.js'),
    'AlertDefinition': require(__commonPath + '/lib/AlertDefinition.class.js'),
};

module.exports = class AlerterApp extends imports.App{

    constructor(args) {
        super(args);

        this.serviceReady = false;

        this.config.loadFromJs(__commonPath + '/resources/configs/config-alerter.js');

        this.initSqlClient();
        this.initAlerter();
        this.initRecurrentJob();
    }
    initAlerter() {
        this.alertDefinitions = this.config.getParameter('definitions').map((x) => new imports.AlertDefinition(x));
        this.logger.info("Creating sample generator");
        this.alerter = new imports.AlertChecker({
            interval: Math.floor(this.config.getParameter('jobInterval')/1000),
            definitions: this.alertDefinitions,
            fieldMapper: this.config.getParameter('fieldMapper'),
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
    initSqlClient() {
        this.sqlClient = imports.mysql;
    }
    initRecurrentJob() {
        let alerter = this.alerter;
        this.alerterJob = new imports.RecurrentJob({
            name: 'Alert Checker job',
            interval: this.config.getParameter('jobInterval'),
            handler: function() {
                let boundOnAlertCheck = () => {
                    this.runFinished();
                    alerter.removeListener('error', boundOnAlertCheck);
                    alerter.removeListener('finished', boundOnAlertCheck);
                };
                alerter.on('error', boundOnAlertCheck);
                alerter.on('finished', boundOnAlertCheck);

                alerter.checkAlerts((err, result) => {
                    if (err) {
                        this.logger.error('Alerter error:', err);
                        return alerter.emit('error', err);
                    }
                    return alerter.emit('finished');
                });
            }
        });
    }

    start() {
        this.alerterJob.start();
    }
};

if (require.main === module) {
    let app = new module.exports();
    app.start();
}
