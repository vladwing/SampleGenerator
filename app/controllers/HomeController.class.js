'use strict';

let imports = {
    "httpStatus" : require('http-status-codes'),
    "Controller" : require(__commonPath + '/lib/Controller.class.js'),
};

module.exports = class HomeController extends imports.Controller {
    rootPage(req, res) {
        return res.render('home.twig', {
            panel: {
                size: 8,
                offset: 2,
                color: "success",
                title: "Sample definitions",
            },
            samples: this.app.sampleDefinitions,
        });
    }
    actionPage(req, res) {
        let id = req.params.id;
        let verb = req.params.verb;
        if (verb && id) {
            switch(verb){
                case 'enable':
                    this.app.sampleDefinitions[id - 1].isEnabled = true;
                    break;
                case 'disable':
                    this.app.sampleDefinitions[id - 1].isEnabled = false;
                    break;
                case 'green':
                    this.app.sampleDefinitions[id - 1].isRed = false;
                    break;
                case 'red':
                    this.app.sampleDefinitions[id - 1].isRed = true;
                    break;
            };
        }
        return res.redirect("/");
    }
};
