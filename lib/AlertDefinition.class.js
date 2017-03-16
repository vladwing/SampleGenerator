'use strict';

const imports = {
    'uniqid': require('uniqid'),
    'url': require('url'),
    'http': require('http'),
    'BaseObject': require(__commonPath + '/lib/BaseObject.class.js'),
};

module.exports = class AlertDefinition extends imports.BaseObject {
    constructor(args) {
        super();

        this.name = args.name || imports.uniqid();
        this.green = {
            min: parseInt(args.greenMin),
            max: parseInt(args.greenMax),
        };
        this.meta = args.meta || {};
        this.endpoint = args.endpoint || null;
        if (this.endpoint) {
            let url = imports.url.parse(this.endpoint);
            this.protocol = url.protocol;
            this.host = url.hostname;
            this.port = url.port || 80;
            this.protocol = url.protocol || "http:";
            this.path = url.path || "/";
        }
    }
    isInRange(value){
        return ((value >= this.green.min) && (value <= this.green.max));
    }

    trigger(data, cb) {
        let payload = {
            'message': `'${this.name}' is out of range [${this.green.min}, ${this.green.max}]`,
            'limits': this.green,
            'name': this.name,
            'meta': this.meta,
            'timestamp': Math.floor(Date.now()/1000),
            'data': data,
        };
        this.logger.debug(`Triggering an alert for ${this.name}`);
        return this.rawRequest(payload, cb);
    }

    rawRequest(payload, cb){
        if (!this.endpoint) {
            this.logger.debug(`This is just a virtual hook for ${this.name}`);
            return cb(null, null);
        }
        if (!payload) {
            payload = null;
        }
        if (!cb || typeof cb !== 'function') {
            throw new Error('You need to specify a callback');
        }
        let payloadData = JSON.stringify(payload);
        let options = {
            hostname: this.host,
            port: this.port,
            protocol: this.protocol,
            method: "POST",
            path: this.path,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': payloadData.length,
            }
        };
        let req = imports.http.request(options, (res) => {
            res.setEncoding('utf8');
            let resultData = "";
            res.on('data', (chunk) => {
                resultData += chunk.toString();
            });
            res.on('end', () => {
                let parsedObject = null;
                try {
                    parsedObject = JSON.parse(resultData);
                } catch(e) {
                    this.logger.trace(`Problem parsing JSON - message ${e.message}:`, resultData);
                    return cb(e, null);
                }
                return cb(null, parsedObject);
            });
            res.on('error', (e) => {
                this.logger.trace(`Problem handling the response: ${e.message}`);
                cb(e, null);
            });
        });
        req.on('error', (e) => {
            this.logger.trace(`Problem in sending the request: ${e.message}`);
            cb(e, null);
        });

        req.write(payloadData);
        req.end();
    }

}
