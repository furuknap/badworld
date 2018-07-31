import { Entity } from "./Entity.js"
export class BuildingDefinition extends Entity {
    constructor(name, id, timerequired) {
        super();
        if (id !== undefined) {
            this.id = id;
        }
        this.name = name;
        this.timerequired = timerequired;
        this.unlockelements = "";
        this.onstart = function (game) { game.crew.available -= this.crewrequired; game.crew.building += this.crewrequired; return game; }
        this.completed = function (game) { game.crew.available += this.crewrequired; game.crew.building -= this.crewrequired; return game; }
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
        return this.timeproduced >= this.definition.timerequired;
    }
    static getFromDefintion(definition) {
        var building = new Building();
        building.definition = definition;
        building.name = definition.name;
        return building;
    }

}
