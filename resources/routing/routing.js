'use strict';

let imports = {
    "Route" : require(__commonPath + '/lib/Route.class.js')
};

module.exports = function(app) {
    app.webApp.get('/', (new imports.Route({
        'app' : app,
        'controllerClass' : __commonPath + '/app/controllers/HomeController.class.js',
        'action' : 'rootPage'
    })).getHandler());
    app.webApp.get('/:verb/:id', (new imports.Route({
        'app' : app,
        'controllerClass' : __commonPath + '/app/controllers/HomeController.class.js',
        'action' : 'actionPage'
    })).getHandler());
};
