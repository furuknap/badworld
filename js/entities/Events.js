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

export class SocialEventDefinition extends EventDefinition {
    createEvent(game) {
        var event = new SocialEvent();
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
        this.eventtriggered = (game) => { return false; }

        this.completed = (game, event) => { return game; }

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

            if (game.buildings.find(b => b.definition.id == "krudefenses") != undefined && game.buildings.find(b => b.definition.id == "krudefenses").powered) {
                odds /= 2;
            }

            if (Services.CrewService.getAvailable(game) < 3) {
                odds = 0; // Creatures do not attack if only a few people are available.
            }

            if (Services.CrewService.getExpedition(game) == Services.CrewService.getTotalCrew(game) && !game.state.campwiped) {
                odds = 50; // Creatures will attack more if base is left empty
            }
            odds /= Math.max(1, game.crew.guards);
            return Math.random() * 100 < odds;
        }

        this.completed = (game, event) => {
            var oddsOfWound = 15;
            var buildingDamageOdds = 20;
            var buildingDamageAmount = 25;

            var wounded = 0;
            var buildingsDamaged = 0;



            if (Services.CrewService.getExpedition(game) == Services.CrewService.getTotalCrew(game)) {
                buildingDamageOdds = 50;
                buildingDamageAmount = 50;
                var text = "event.kruraid.regular";
                if (game.research.some(r => r.definition.id == "krulanguagebasics" && r.iscomplete())) {
                    text = "event.kruraid.namediscovered";
                }
                game.state.campwiped = true;
                game.notifications.push(new Notification(text, null, 5))
            }

            oddsOfWound /= Math.max(1, game.crew.guards);
            if (game.state.part1complete) {
                oddsOfWound = 0; /// TODO: temporary until part 2 gets started.
            }
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
                    building.damage = Math.min(100, building.damage);
                    buildingsDamaged++;
                }
            }

            game.attacks.count++;

            var text = "event.kruattack.regular";
            if (game.research.some(r => r.definition.id == "krulanguagebasics" && r.iscomplete())) {
                text = "event.kruattack.namediscovered";
            }
            if (game.attacks.count >= 2) {
                game.notifications.push(new Notification(text, null, 3));
            }

            if (game.buildings.some(b => b.definition.id == "krucage" && b.iscomplete()) && !game.state.krucaptive) {
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

export class SocialEvent extends EventBase {
    constructor() {
        super();
        this.textid = "event.socialevent.name";
        this.type = "social";
    }
}