import { Entity } from "./Entity.js"
export class QuestDefinition extends Entity {
    constructor(name, id, timerequired) {
        super();
        this.id = id;
        this.name = name;
        this.timerequired = timerequired;
        this.unlockelements = "";

    }
}

export class Quest extends Entity {
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
