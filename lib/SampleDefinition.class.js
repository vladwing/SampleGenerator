'use strict';

const imports = {
    'uniqid': require('uniqid'),
    'BaseObject': require(__commonPath + '/lib/BaseObject.class.js'),
};

module.exports = class SampleDefinition extends imports.BaseObject {
    constructor(id, args) {
        super();

        this.id = id;
        this.name = args.name || imports.uniqid();
        this.green = {
            min: parseInt(args.greenMin),
            max: parseInt(args.greenMax),
        };
        this.distribution = args.distribution || 'normal'; // ignored for now
        this.isRed = false;
        this.isEnabled = false;
        this.red = {
            min: parseInt(args.redMin),
            max: parseInt(args.redMax),
        };
        this.meta = args.meta || {};
    }
    getColor() {
        return this.isEnabled ? (this.isRed? "text-danger": "text-primary"): "text-default"
    }
    getText(type) {
        switch(type) {
            case "enable":
                return this.isEnabled ? "disable": "enable";
            case "red":
                return this.isRed ? "generate green": "generate red";
        }
    }
    getUrl(type) {
        switch(type) {
            case "enable":
                return this.isEnabled ? `/disable/${this.id}`: `/enable/${this.id}`;
            case "red":
                return this.isRed ? `/green/${this.id}`: `/red/${this.id}`;
        }
    }
    setIsRed(isRed) {
        this.isRed = isRed;
    }

    setIsEnabled(isEnabled) {
        this.isEnabled = isEnabled;
    }

    getUniform(interval) {
        return Math.floor(Math.random() * (interval.max - interval.min + 1)) + interval.min;
    }

    getSample() {
        let sample;
        if (this.isRed) {
            sample = this.getUniform(this.red);
        } else {
            sample = this.getUniform(this.green);
        }
        this.lastSample = sample;
        return {
            name: this.name,
            value: sample,
            meta: this.meta,
        };
    }
}
