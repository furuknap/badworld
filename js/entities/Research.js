import { Entity } from "./Entity.js"
import * as Services from "../services/services.js"

export class ResearchDefinition extends Entity {
    constructor(name, id, timerequired) {
        super();
        this.id = id;
        this.name = name;
        this.timerequired = timerequired;
        this.unlockelements = "";
        this.onstart = function (game) {
            return Services.CrewService.changeResearch(game, this.crewrequired);
        }
        this.completed = function (game) {
            return Services.CrewService.changeResearch(game, 0 - this.crewrequired);
        }

    }
}

export class Research extends Entity {
    constructor() {
        super();
        this.definition = null;
        this.timeproduced = 0;
        this.inprogress = false;

    };
    iscomplete() {
        return this.timeproduced >= this.definition.timerequired;
    }
    static getFromResearchDefintion(researchDefinition) {
        var research = new Research();
        research.definition = researchDefinition;
        research.name = researchDefinition.name;
        return research;
    }
    static toClass(obj, proto) {
        obj.__proto__ = proto;
        return obj;
    }
}
