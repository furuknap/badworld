import { Entity } from "./Entity.js"
import { Notification } from "./entities.js";
import { Language } from "../utilities/utilities.js";
import * as Services from "../services/services.js"

class EventDefinition extends Entity {
    constructor() {
        super();
        this.unlockcondition = (game) => { return true; }
        this.eventtriggered = (game) => { return false; }
        this.onupdate = (game, event) => { return game; }
    }
}

class EventBase extends Entity {
    constructor() {
        super();
        this.inprogress = () => { return false; }
        this.onupdate = (game, event) => { return game; }
        this.timeprogress = 0;
        this.definition = {};
        this.type = "";
    }
    iscomplete() {
        return this.timeprogress >= this.definition.timerequired;
    }
}

export class AttackEventDefinition extends EventDefinition {
    createEvent(game) {
        var event = new AttackEvent();
        event.definition = this;
        return event;
    }

    constructor(id) {
        super();
        if (id !== undefined) {
            this.id = id;
        }
        this.timerequired = 0;
        this.unlockelements = "";
        this.eventtriggered = (game) => {
            var odds = 2;
            if (game.attacks.count == 0) {
                odds = 10;
            }
            return Math.random() * 100 < odds;
        }
        
        this.completed = (game, event) => {
            var oddsOfWound = 10;
            var buildingDamageOdds = 10;
            var buildingDamageAmount = 10;

            var wounded = 0;
            var buildingsDamaged = 0;
            for (var i = 0; i < Services.CrewService.getAvailable(game); i++) {
                if (Math.random() * 100 < oddsOfWound) {
                    Services.CrewService.changeWounded(game, 1);
                    wounded++;
                }
            }

            for (var i = 0; i < game.buildings.length; i++) {
                var building = game.buildings[i];
                if (Math.random() * 100 < buildingDamageOdds) {
                    building.damage += parseInt(Math.random() * buildingDamageAmount);
                    buildingsDamaged++;
                }
            }

            //var text = "";

            //if (game.attacks.count == 0) {
            //    text = Language.getText("event.kruattack.first");
            //}
            //else {
            //}

            //if (wounded > 0) {
            //    text += Language.getText("event.kruattack.wounded");
            //}
            //else {
            //    text += Language.getText("event.kruattack.nowounded");
            //}
            //if (buildingsDamaged > 0) {
            //    text += Language.getText("event.kruattack.damaged");
            //}
            //else {
            //    text += Language.getText("event.kruattack.nodamaged");
            //}

            game.attacks.count++;

            var text = "event.kruattack.regular";
            if (game.research.some(r => r.id == "kruintro")) {
                text = "event.kruattack.namediscovered";
            }
            if (game.attacks.count >= 2) {
                game.notifications.push(new Notification(text, null, 5));
            }

            if (game.buildings.some(b => b.definition.id == "krucage") && !game.state.krucaptive) {
                if (Math.random() * 100 > 50) {
                    game.state.krucaptive = true;
                }
            }


            return game;
        }

    }
}

export class AttackEvent extends EventBase {
    constructor() {
        super();
        this.textid = "event.kruattack.name";
        this.type = "attack";
    }
}