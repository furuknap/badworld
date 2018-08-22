import { GameService } from "./gameService.js"
import { ShipResearch } from "../entities/ShipResearch.js"
import * as Services from "./services.js"
import { QuestDefinition } from "../entities/Quest.js"
import { Language } from "../utilities/LanguageUtilities.js";
import { Notification } from "../entities/entities.js";
import { ShipResearchDefinition } from "../entities/ShipResearch.js";

export class ShipResearchService extends GameService {
    updateGame(game, deltaTime) {
        for (var i = 0; i < game.shipresearch.length; i++) {
            var research = game.shipresearch[i];
            var wascomplete = research.iscomplete();
            if (research.inprogress && !research.iscomplete()) {
                research.pointsproduced += ((deltaTime * game.crew.shipresearch)/game.shipresearch.length);
                game = research.definition.onupdate(game, research);
                if (research.iscomplete() && !research.wascomplete) {
                    game = research.definition.completed(game, research);
                }
            }
        }
        return game;
    }

    static startResearch(game, researchDefinitionID) {
        var foundDefinition;
        for (var i = 0; i < this.availableDefinitions(game).length; i++) {
            var r = this.availableDefinitions(game)[i];
            if (r.id == researchDefinitionID) {
                foundDefinition = r;
                break;
            }
        }
        if (typeof foundDefinition != typeof undefined) {
            if (foundDefinition.crewrequired <= Services.CrewService.getAvailable(game)) {
                var research = ShipResearch.getFromDefintion(foundDefinition);
                research.inprogress = true;
                game.shipresearch.push(research);
                game = research.definition.onstart(game, research);
            }
            else {
                game.notifications.push(new Notification("notenoughcrewavailable", null, 3));
            }
        }
    }

    static allDefinitions() {
        if (ShipResearchService.definitions == undefined || ShipResearchService.definitions.length == 0) {
            ShipResearchService.definitions = [];

            var shipexterior = new ShipResearchDefinition(Language.getText("shipresearch.exterior.name"), "shipexterior", 60);
            shipexterior.crewrequired = 0;
            shipexterior.onupdate = (game, research) => {
                research.pointsproduced++;
                return game;
            };
            ShipResearchService.definitions.push(shipexterior);

            var shipinterior = new ShipResearchDefinition(Language.getText("shipresearch.interior.name"), "shipinterior", 60);
            shipinterior.crewrequired = 0;
            shipinterior.prerequisiteshipresearch.push({ id: "shipexterior" });
            shipinterior.onupdate = (game, research) => {
                research.pointsproduced++;
                return game;
            };
            ShipResearchService.definitions.push(shipinterior);

        }

        return ShipResearchService.definitions;
    }

    static availableDefinitions(game) {
        var availableDefinitions = [];
        var allDefinitions = this.allDefinitions();
        for (var i = 0; i < allDefinitions.length; i++) {
            var definition = allDefinitions[i];
            var completed = game.shipresearch.some(gr => gr.definition.id == definition.id && (gr.iscomplete() || gr.inprogress));
            var researchReqsMet = definition.prerequisiteresearch.every(r => game.research.some(gr => gr.definition.id == r.id && gr.iscomplete()));
            var buildingsReqsMet = definition.prerequisitebuildings.every(b => game.buildings.some(gb => gb.definition.id == b.id && gb.iscomplete()));
            var shipReqsMet = definition.prerequisiteshipresearch.every(s => game.shipresearch.some(gs => gs.definition.id == s.id && gs.iscomplete()));
            var discoveriesReqsMet = definition.prerequisitediscoveries.every(d => game.discoveries.some(gd => gd.definition.id == d.id && gd.iscomplete()));
            var unlocked = definition.unlockcondition(game);

            if (!completed && researchReqsMet && buildingsReqsMet && discoveriesReqsMet && shipReqsMet && unlocked) {
                availableDefinitions.push(definition);
            }
        }
        return availableDefinitions;
    }
}