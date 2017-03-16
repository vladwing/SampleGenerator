'use strict';


const imports = {
    'BaseObject': require(__commonPath + '/lib/BaseObject.class.js'),
};

module.exports = class OutputDriver extends imports.BaseObject {
    constructor(args) {
        super();
        this.tableName = args.tableName;
        this.dbConfig = args.dbConfig;
        this.initFieldMapper(args.fieldMapper);
        this.initSqlClient(args.client);
    }

    initSqlClient(client) {
        this.client = client;
    }

    getConnection() {
        return this.client.createConnection(this.dbConfig);
    }

    initFieldMapper(fieldMapper) {
        this.keys = Object.keys(fieldMapper);
        this.queryPrefix = "INSERT INTO " + this.tableName + ' (' + this.keys.join(', ') + ' ) VALUES ';
        this.fieldMapper = {};
        for (let key of this.keys) {
            let path = fieldMapper[key].split('.');
            if (path.shift() !== 'sample') {
                throw new Error(`Invalid field mapper expression: ${expr}`);
            }
            this.fieldMapper[key] = path;
        }
    }

    buildQuery(mappingList) {
        return this.queryPrefix + mappingList.map( (mapping) => {
            let values = this.keys.map( (key) => "'" + mapping[key] + "'");
            return "( " + values.join(', ') + " )";
        }).join(', ');
    }

    getParameterMapping(sample) {
        let parameters = { };
        for (let key of this.keys) {
            let value = this.fieldMapper[key].reduce((o,i)=>o[i], sample);
            if (value === undefined) {
                throw new Error(`Invalid field mapper expression: ${expr} for ${sample}`);
            }
            parameters[key] = value;
        }
        return parameters;
    }

    processSamples(samples, cb) {
        if (!samples || samples.length === 0) {
            return cb("No definitions are enabled", null);
        }
        let mappingList = samples.map((sample) => this.getParameterMapping(sample));
        let query = this.buildQuery(mappingList);
        this.logger.debug(query);
        let connection = this.getConnection();
        connection.connect();
        connection.query(query, (err, result) => {
            connection.end();
            if (err) {
                return cb(err, null);
            }
            cb(null, result);
        });
    }
};
