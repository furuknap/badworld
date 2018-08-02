import { Entity } from "./Entity.js"
export class QuestDefinition extends Entity {
    constructor(name, id, timerequired) {
        super();
        this.id = id;
        this.name = name;
        this.timerequired = timerequired;
        this.unlockelements = "";
        this.onstart = function (game) { game.crew.available -= this.crewrequired; game.crew.quest += this.crewrequired; return game; }
        this.completed = function (game) { game.crew.available += this.crewrequired; game.crew.quest -= this.crewrequired; return game; }
        this.cancel = function (game, quest) { game.quests = game.quests.filter(q=>q.id!==quest.id); return game; }

    }
}

export class Quest extends Entity {
    constructor() {
        super();
        this.definition = null;
        this.timeproduced = 0;
        this.inprogress = false;
        this.crew = 0;

    };
    iscomplete() {
        return this.timeproduced >= this.definition.timerequired;
    }
    static getFromDefintion(definition) {
        var quest = new Quest();
        quest.definition = definition;
        quest.name = definition.name;

        return quest;
    }
    static toClass(obj, proto) {
        obj.__proto__ = proto;
        return obj;
    }
}
