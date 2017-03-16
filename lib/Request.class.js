'use strict';

let imports = {
    "url" : require('url'),
    "util" : require('util'),
    "IncomingMessage" : require('http').IncomingMessage,

    "BaseObject" : require(__commonPath + '/lib/BaseObject.class.js'),
};

module.exports = class Request extends imports.BaseObject {
    constructor(request){
        super();

        this.requestClosed = false;
        this.requestUrl = {};

        this.setRequest(request);
    }
    setRequest(request) {
        this.request = request;

        if (this.request instanceof imports.IncomingMessage) {
            this.requestUrl = imports.url.parse(this.request.originalUrl || '');

            let requestInfo = {
                'ip' : this.request.socket.remoteAddress,
                'port' : this.request.socket.remotePort,
                'family' : this.request.socket.remoteFamily,
                'url' : this.requestUrl.path,
                'body' : this.getBody()
            };
            this.debug('Request created', requestInfo);
            this.request.on("abort", () => {
                this.debug('Request aborted', requestInfo);
            });
            this.request.on("close", () => {
                this.debug('Request closed unexpectedly', requestInfo);
                this.requestClosed = true;
                this.emit('close');
            });
            this.request.on("end", () => {
                this.debug('Request ended normally', requestInfo);
            });
        } else {
            this.debug('Invalid request', request);
            throw new Error('Invalid request', request);
        }
    }
    get params() {
        return (this.request && this.request.params) || {};
    }
    get query() {
        return (this.request && this.request.query) || {};
    }
    getPath() {
        return this.requestUrl.path;
    }
    get(key, defaultValue) {
        defaultValue = typeof defaultValue === "undefined" ? null : defaultValue;
        return this.query[key] || defaultValue;
    }
    getRequest() {
        return this.request;
    }
    getBody() {
        return this.request.body || null;
    }
    isClosed() {
        return this.requestClosed;
    }
};
