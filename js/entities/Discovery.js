import { Entity } from "./Entity.js"
export class DiscoveryDefinition extends Entity {
    constructor(name, id, pointsrequired) {
        super();
        this.id = id;
        this.name = name;
        this.pointsrequired = pointsrequired;
        this.prerequisiteshipresearch = [];
        this.prerequisiteresearch = [];
        this.prerequisitebuildings = [];
        this.unlockelements = "";
        this.unlockcondition = function () { return true; };
        this.completed = function (game) { return game; };
        this.onupdate = function (game) { return game; };
        this.onstart = function (game) { return game; };
    }
}

export class Discovery extends Entity {
    constructor() {
        super();
        this.definition = null;
        this.pointsproduced = 0;
        this.active = false;

    };
    iscomplete() {
        return this.pointsproduced >= this.definition.pointsrequired;
    }
    static getFromDefintion(definition) {
        var discovery = new Discovery();
        discovery.definition = definition;
        discovery.name = definition.name;
        return discovery;
    }
    static toClass(obj, proto) {
        obj.__proto__ = proto;
        return obj;
    }
}