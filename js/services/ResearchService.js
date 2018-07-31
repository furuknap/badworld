import { GameService } from "./gameService.js"
import { Research } from "../entities/Research.js"
import * as Services from "./services.js"
import { ResearchDefinition } from "../entities/Research.js"
import { Language } from "../utilities/LanguageUtilities.js";

export class ResearchService extends GameService {
    updateGame(game, deltaTime) {
        for (var i = 0; i < game.research.length; i++) {
            var research = game.research[i];
            var wascomplete = research.iscomplete;
            if (research.inprogress && !research.iscomplete()) {
                research.timeproduced += deltaTime;
                if (research.iscomplete() && !research.wascomplete) {
                    
                }
            }
        }
        return game;
    }

    static startResearch(game, researchDefinitionID) {
        var foundResearchDefinition;
        for (var i = 0; i < this.availableResearchDefinitions(game).length; i++) {
            var r = this.availableResearchDefinitions(game)[i];
            if (r.id == researchDefinitionID) {
                foundResearchDefinition = r;
                break;
            }
        }
        if (typeof foundResearchDefinition != typeof undefined) {
            if (r.crewrequired <= game.crew.available) {
                var research = Research.getFromResearchDefintion(foundResearchDefinition);
                research.inprogress = true;
                game.research.push(research);
            }
            else {
                game.notifications.push(new Notification(Language.getText("notenoughcrewavailable")));
            }
        }
    }

    static allDefinitions() {
        var surroundings = new ResearchDefinition(Language.getText("research.surroundings.name"), "surroundings");
        surroundings.timerequired = 5;

        var safeShelter = new ResearchDefinition(Language.getText("research.secureshelter.name"), "safeShelter");
        safeShelter.prerequisiteresearch.push(surroundings)
        safeShelter.timerequired = 30;

        //var searchjungle = new ResearchDefinition(Language.getText("research.searchjungle.name"), "searchjungle");
        //searchjungle.prerequisitebuildings = Services.BuildingService.allBuildingDefinitions().filter(b => b.id == "largerhut");
        //searchjungle.prerequisiteresearch.push(safeShelter);
        //searchjungle.timerequired = 5;

        return [surroundings, safeShelter];
    }

    static availableResearchDefinitions(game) {
        var availableResearchDefinitions = [];
        var allResearchDefinitions = this.allDefinitions();
        for (var i = 0; i < allResearchDefinitions.length; i++) {
            var researchDefinition = allResearchDefinitions[i];
            var completed = game.research.some(gr => gr.definition.id == researchDefinition.id && (gr.iscomplete() || gr.inprogress));
            var researchReqsMet = researchDefinition.prerequisiteresearch.every(r => game.research.some(gr => gr.definition.id == r.id && gr.iscomplete()));
            var buildingsReqsMet = researchDefinition.prerequisitebuildings.every(b => game.buildings.some(gb => gb.definition.id == b.id && gb.iscomplete()));
            var shipReqsMet = researchDefinition.prerequisiteshipresearch.every(s => game.shipresearch.some(gs => gs.definition.id == s.id && gs.iscomplete()));
            var unlocked = researchDefinition.unlockcondition(game);

            if (! completed && researchReqsMet && buildingsReqsMet && unlocked) {
                availableResearchDefinitions.push(researchDefinition);
            }
        }
        return availableResearchDefinitions;
    }
}

