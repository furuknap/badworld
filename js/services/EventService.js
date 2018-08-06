import { GameService } from "./gameService.js"
import * as Services from "./services.js"
import * as Events from "../entities/Events.js"
import { Language } from "../utilities/LanguageUtilities.js";
import { Notification } from "../entities/entities.js";
import { AttackEventDefinition } from "../entities/Events.js";

export class EventService extends GameService {
    updateGame(game, deltaTime) {
        for (var i = 0; i < EventService.availableDefinitions(game).length; i++) {
            var definition = EventService.availableDefinitions(game)[i];
            if (definition.eventtriggered(game)) {
                var event = definition.createEvent(game);
                game.events.push(event);
            }

        }
        var completedeventids = [];
        for (var i = 0; i < game.events.length; i++) {
            var event = game.events[i];
            event.timeprogress += deltaTime;
            game = event.definition.onupdate(game);
            if (event.iscomplete()) {
                completedeventids.push(i);
                game = event.definition.completed(game, event);
            }
        }

        for (var i = 0; i < completedeventids.length; i++) {
            game.events.splice(completedeventids[i],1);
        }


        return game;
    }

    static allDefinitions() {
        if (EventService.definitions == undefined || EventService.definitions.length == 0) {
            EventService.definitions = [];

            var attackEventDefinition = new AttackEventDefinition();
            attackEventDefinition.timerequired = 0; // instant event
            attackEventDefinition.prerequisitediscoveries = Services.DiscoveryService.allDefinitions().filter(b => b.id == "noisesintro");
            
            EventService.definitions.push(attackEventDefinition);


   


        }

        return EventService.definitions;
    }

    static availableDefinitions(game) {
        var availableDefinitions = [];
        var allDefinitions = this.allDefinitions();
        for (var i = 0; i < allDefinitions.length; i++) {
            var definition = allDefinitions[i];
            var completed = game.research.some(gr => gr.definition.id == definition.id && (gr.iscomplete() || gr.inprogress));
            var researchReqsMet = definition.prerequisiteresearch.every(r => game.research.some(gr => gr.definition.id == r.id && gr.iscomplete()));
            var buildingsReqsMet = definition.prerequisitebuildings.every(b => game.buildings.some(gb => gb.definition.id == b.id && gb.iscomplete()));
            var shipReqsMet = definition.prerequisiteshipresearch.every(s => game.shipresearch.some(gs => gs.definition.id == s.id && gs.iscomplete()));
            var discoveriesReqsMet = definition.prerequisitediscoveries.every(d => game.discoveries.some(gd => gd.definition.id == d.id && gd.iscomplete()));
            var unlocked = definition.unlockcondition(game);

            if (!completed && researchReqsMet && buildingsReqsMet &&discoveriesReqsMet && unlocked) {
                availableDefinitions.push(definition);
            }
        }
        return availableDefinitions;
    }
}