import { Entity } from "./Entity.js"
import * as Services from "../services/services.js"

export class ShipResearchDefinition extends Entity {
    constructor(name, id, pointsrequired) {
        super();
        this.id = id;
        this.name = name;
        this.pointsrequired = pointsrequired;
        this.unlockelements = "";
        this.onupdate = function (game) { return game; };

        this.onstart = function (game) {
            return Services.CrewService.changeResearch(game, this.crewrequired);
        }
        this.completed = function (game) {
            return Services.CrewService.changeResearch(game, 0 - this.crewrequired);
        }
    }

}


export class ShipResearch extends Entity {
    constructor() {
        super();
        this.definition = null;
        this.pointsproduced = 0;
        this.inprogress = false;

    };
    iscomplete() {
        return this.pointsproduced >= this.definition.pointsrequired;
    }
    static getFromDefintion(definition) {
        var research = new ShipResearch();
        research.definition = definition;
        research.name = definition.name;
        return research;
    }
    static toClass(obj, proto) {
        obj.__proto__ = proto;
        return obj;
    }
}
