export class Entity {
    constructor() {
        this.id = guid();
        this.name = "";

        this.prerequisiteshipresearch = [];
        this.prerequisiteresearch = [];
        this.prerequisitebuildings = [];
        this.prerequisitediscoveries = [];
        this.unlockelements = "";
        this.crewrequired = 1;

        this.unlockcondition = function () { return true; };
        this.completed = function (game) { return game; };
        this.onupdate = function (game) { return game; };
        this.onstart = function (game) { return game; };
        this.postrender = function (game, html) { return html; };
    }

    static toClass(obj, proto) {
        obj.__proto__ = proto;
        return obj;
    }
}


function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}