'use strict';

let imports = {
    "httpStatus" : require('http-status-codes'),
    "BaseObject" : require(__commonPath + '/lib/BaseObject.class.js'),
    "Request" : require(__commonPath + '/lib/Request.class.js'),
};

module.exports = class Route extends imports.BaseObject {
    constructor(args){
        super();

        this.app = args.app;
        this.controllerClass = null;
        this.action = null;
        this.wrappedHandler = (req, resp) => this.handle(req, resp);

        if (args.controllerClass && args.action) {
            this.controllerClass = require(args.controllerClass);
            this.action = args.action;
        } else {
            throw new Error('Must specify "controllerClass" and "action" arguments');
        }
    }
    getHandler() {
        return this.wrappedHandler;
    }
    handle(request, resp) {

        let req = new imports.Request(request);
        // create the request /response wrapper
        resp.setHeader('Server', this.app.config.getParameter('app.name'));

        if (!this.app.serviceReady) {
            req.warn("Service is not enabled");
            return resp.sendStatus(imports.httpStatus.SERVICE_UNAVAILABLE);
        }

        req.info("Handling request", req.method, req.originalUrl, req.query);
        req.info("Creating the route controller: " + this.controllerClass.name);

        // create the controller
        let controller = new this.controllerClass();
        controller.setApp(this.app);
        return controller[this.action](req, resp);
    }
};
