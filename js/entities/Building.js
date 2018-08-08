import { Entity } from "./Entity.js"
import * as Services from "../services/services.js"

export class BuildingDefinition extends Entity {
    constructor(name, id, timerequired) {
        super();
        if (id !== undefined) {
            this.id = id;
        }
        this.name = name;
        this.timerequired = timerequired;
        this.unlockelements = "";
        this.onstart = function (game) {
            return Services.CrewService.changeBuilding(game, this.crewrequired);
        }
        this.completed = function (game) {
            return Services.CrewService.changeBuilding(game, 0 - this.crewrequired);
        }
    }
}

export class Building extends Entity {
    constructor() {
        super();
        this.definition = null;
        this.timeproduced = 0;
        this.inprogress = false;
    };
    iscomplete() {
        if (this.damage > 0) {
            return false;
        }
        return (this.timeproduced >= this.definition.timerequired);
    }
    static getFromDefintion(definition) {
        var building = new Building();
        building.definition = definition;
        building.name = definition.name;
        return building;
    }

}
