'use strict';


const imports = {
    'BaseObject': require(__commonPath + '/lib/BaseObject.class.js'),
};

module.exports = class AlertChecker extends imports.BaseObject {
    constructor(args) {
        super();
        this.client = args.client;
        this.dbConfig = args.dbConfig || {};
        this.interval = args.interval;
        this.buildQuery(args.fieldMapper, args.definitions || []);
    }
    getConnection() {
        return this.client.createConnection(this.dbConfig);
    }
    buildQuery(fieldMapper, definitions) {
        this.tableName = fieldMapper.tableName;
        this.query = `SELECT * FROM ${this.tableName} WHERE `;
        let subQueries = [];
        this.definitions = {};
        this.fieldMapper = fieldMapper;
        this.definitionCount = definitions.length;
        for (let definition of definitions) {
            this.definitions[definition.meta.id] = definition; // TODO: create the primary key from the fieldMapper
            let subQuery = `IDParam = '${definition.meta.id}'`; // TODO: build this expression from the fieldMapper
            subQuery += ` AND ${fieldMapper.timestampField} > DATE_SUB(NOW(), INTERVAL ${this.interval} SECOND)`;
            subQuery = "(" + subQuery + ")";
            subQueries.push(subQuery);
        }
        this.query += subQueries.join(' OR ');
        this.logger.debug(this.query);
    }
    checkAlerts(cb) {
        let connection = this.getConnection();
        connection.connect();
        connection.query(this.query, (err, results) => {
            connection.end();
            if (err) {
                return cb(err, null);
            }
            let stats = {
                total: this.definitionCount,
                received: results.length,
                outOfRange: 0,
            };
            for (let result of results) {
                let definition = this.definitions[this.getPrimaryKey(result)];
                if (!definition.isInRange(this.getValue(result))) {
                    definition.trigger(result, (err,result) => {
                        this.logger.trace("Web hook returned", err, result);
                    });
                    stats.outOfRange++;
                }
            }
            if (stats.received === stats.total) {
                this.logger.info(`Received info on ${stats.received}/${stats.total} values`);
            } else {
                this.logger.error(`Received info on ${stats.received}/${stats.total} values`);
            }
            if (stats.outOfRange) {
                this.logger.error(`${stats.outOfRange}/${stats.total} values were out of range`);
            } else {
                this.logger.info(`${stats.outOfRange}/${stats.total} values were out of range`);
            }
            cb(null, results);
        });
    }

    getPrimaryKey(result) {
        return result.IDParam; // TODO: build this from the fieldMapper
    }
    getValue(result) {
        return result[this.fieldMapper.valueField];
    }
}
