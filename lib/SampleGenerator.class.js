'use strict';


const imports = {
    'BaseObject': require(__commonPath + '/lib/BaseObject.class.js'),
};

module.exports = class SampleGenerator extends imports.BaseObject {
    constructor(args) {
        super();
        this.definitions = args.definitions || [];
        this.driver = args.driver;
    }

    setIsRed(index, value) {
        this.definitions[index].setIsRed(value);
    }

    getCurrentTimestamp() {
        let m = new Date();
        return {
            timestamp: Math.floor(Date.now()/1000),
            dateTimeMysql:  m.getFullYear() +"-"+ (m.getMonth()+1) +"-"+ m.getDate() + " " + m.getHours() + ":" + m.getMinutes() + ":" + m.getSeconds(),
            dateTimeMysqlUTC:  m.getUTCFullYear() +"-"+ (m.getUTCMonth()+1) +"-"+ m.getUTCDate() + " " + m.getUTCHours() + ":" + m.getUTCMinutes() + ":" + m.getUTCSeconds(),
        };
    }

    generateSamples(cb) {
        let definitions = this.definitions.filter( (def) => def.isEnabled);
        let samples = definitions.map((x) => Object.assign(this.getCurrentTimestamp(), x.getSample()));
        this.driver.processSamples(samples, cb);
    }
}
