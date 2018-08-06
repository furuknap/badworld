import { GameService } from "./gameService.js"
import { Discovery } from "../entities/Discovery.js"
import * as Services from "./services.js"
import { DiscoveryDefinition } from "../entities/Discovery.js"
import { Language } from "../utilities/LanguageUtilities.js";
import { Notification } from "../entities/entities.js";



export class DiscoveryService extends GameService {
    updateGame(game, deltaTime) {
        if (DiscoveryService.getActiveDiscovery(game) != undefined && DiscoveryService.getActiveDiscovery(game).iscomplete()) {
            DiscoveryService.getActiveDiscovery(game).active = false;
        }
        return game;
    }
    static getActiveDiscovery(game) {
        return game.discoveries.find(d => d.active);
    }
    static setActiveDiscovery(game, discoveryid) {
        game.discoveries.forEach(function (element) {
            game.discoveries.find(d => d.definition.id == element.definition.id).active = false;
        });
        if (!game.discoveries.some(d=>d.definition.id == discoveryid)) {
            var discovery = Discovery.getFromDefintion(this.availableDefinitions(game).find(d=>d.id == discoveryid));
            game.discoveries.push(discovery);
        }
        var discovery = game.discoveries.find(d => d.definition.id == discoveryid);
        discovery.active = true;
        discovery.pointsproduced += game.discoverypoints; // May want to redo this to collect overflow points. Or maybe not.
        game.discoverypoints = 0;
        return game;
    }
    static availableDefinitions(game) {
        var availableDefinitinos = [];
        var allDefinitions = this.allDefinitions();
        for (var i = 0; i < allDefinitions.length; i++) {
            var definition = allDefinitions[i];
            var completed = game.discoveries.some(gb => gb.definition.id == definition.id && (gb.iscomplete()));
            var researchReqsMet = definition.prerequisiteresearch.every(r => game.research.some(gr => gr.definition.id == r.id && gr.iscomplete()));
            var buildingsReqsMet = definition.prerequisitebuildings.every(b => game.buildings.some(gb => gb.definition.id == b.id && gb.iscomplete()));
            var shipReqsMet = definition.prerequisiteshipresearch.every(s => game.shipresearch.some(gs => gs.definition.id == s.id && gs.iscomplete()));
            var unlocked = definition.unlockcondition(game);

            if (!completed && researchReqsMet && buildingsReqsMet && unlocked) {
                availableDefinitinos.push(definition);
            }
        }
        return availableDefinitinos;
    }
    static addPoints(game, points) {
        if (points > 0) {
            var discovery = this.getActiveDiscovery(game);
            if (discovery != undefined) {
                discovery.pointsproduced += points;
                game.discoverypoints -= points;
                game.discoverypoints = Math.max(0, game.discoverypoints);
            }
            else {
                game.discoverypoints += points;
            }
            if (game.discoverypoints == points && !game.discoveries.some(d => d.active)) {
                game.notifications.push(new Notification("discovery.pointsearned"));
            }
        }
    }
    static allDefinitions() {
        if (DiscoveryService.definitions == undefined || DiscoveryService.definitions.length == 0) {
            DiscoveryService.definitions = [];

            var shipintro = new DiscoveryDefinition(Language.getText("discovery.shipintro.name"));
            shipintro.id = "shipintro";
            shipintro.pointsrequired = 5;
            shipintro.unlockcondition = function (game) { return game.discoverypoints > 0 || game.discoveries.length>0; };
            DiscoveryService.definitions.push(shipintro);

            var shiplocation = new DiscoveryDefinition(Language.getText("discovery.shiplocation.name"));
            shiplocation.id = "shiplocation";
            shiplocation.pointsrequired = 500;
            shiplocation.unlockcondition = function (game) { return game.discoveries.some(d=>d.definition.id=="shipintro" && d.iscomplete()); };
            DiscoveryService.definitions.push(shiplocation);

            var sourceofnoises = new DiscoveryDefinition(Language.getText("discovery.noises.name"));
            sourceofnoises.id = "noisesintro";
            sourceofnoises.pointsrequired = 5;
            sourceofnoises.unlockcondition = function (game) { return game.texts.some(t => t.id == 7) > 0; };
            DiscoveryService.definitions.push(sourceofnoises);

            var medicinalplants = new DiscoveryDefinition(Language.getText("discovery.medicinalplants.name"));
            medicinalplants.id = "medicinalplants";
            medicinalplants.pointsrequired = 20;
            medicinalplants.prerequisitebuildings = Services.BuildingService.allDefinitions().filter(b => b.id == "medicalstation");
            DiscoveryService.definitions.push(medicinalplants);

        }

        return DiscoveryService.definitions;
    }


}