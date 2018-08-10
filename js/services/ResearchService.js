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
        for (var i = 0; i < this.availableResearchDefinitions(game).length; i++) {
            var r = this.availableResearchDefinitions(game)[i];
            if (r.id == researchDefinitionID) {
                foundDefinition = r;
                break;
            }
        }
        if (typeof foundDefinition != typeof undefined) {
            if (foundDefinition.crewrequired <= Services.CrewService.getAvailable(game)) {
                var research = Research.getFromResearchDefintion(foundDefinition);
                research.inprogress = true;
                game.research.push(research);
                game = research.definition.onstart(game, research);
            }
            else {
                game.notifications.push(new Notification("notenoughcrewavailable", null, 3));
            }
        }
    }


    static allDefinitions() {
        if (ResearchService.definitions == null || ResearchService.definitions.length == 0) {
            ResearchService.definitions = [];
            var surroundings = new ResearchDefinition(Language.getText("research.surroundings.name"), "surroundings");
            surroundings.timerequired = 5;
            surroundings.crewrequired = 6;
            ResearchService.definitions.push(surroundings);

            var safeShelter = new ResearchDefinition(Language.getText("research.secureshelter.name"), "safeShelter");
            safeShelter.prerequisiteresearch.push(surroundings)
            safeShelter.timerequired = 30;
            surroundings.crewrequired = 3;
            ResearchService.definitions.push(safeShelter);

            var medicinalplants = new ResearchDefinition(Language.getText("research.medicinalplants.name"), "medicinalplants");
            medicinalplants.prerequisitediscoveries.push({ id: "medicinalplants" });
            medicinalplants.timerequired = 120;
            medicinalplants.unlockelements = ".inventoryControls";
            ResearchService.definitions.push(medicinalplants);

            var medicinalplantsbase = new ResearchDefinition(Language.getText("research.medicinalplantsbase.name"), "medicinalplantsbase");
            medicinalplantsbase.prerequisiteresearch.push(medicinalplants);
            medicinalplantsbase.timerequired = 120;
            ResearchService.definitions.push(medicinalplantsbase);

            var medkit = new ResearchDefinition(Language.getText("research.medkit.name"), "medkit");
            medkit.prerequisiteresearch.push(medicinalplantsbase);
            medkit.timerequired = 70;
            medkit.crewrequired = 1;
            ResearchService.definitions.push(medkit);

            var krucapture = new ResearchDefinition(Language.getText("research.krucapture.name"), "krucapture");
            krucapture.unlockcondition = (game) => { return game.attacks.count > 2; };
            krucapture.timerequired = 100;
            ResearchService.definitions.push(krucapture);

            var kruintro = new ResearchDefinition(Language.getText("research.kruintro.name"), "kruintro");
            kruintro.unlockcondition = (game) => { return game.state.krucaptive; };
            kruintro.timerequired = 60;
            ResearchService.definitions.push(kruintro);

            var krulanguagebasics = new ResearchDefinition(Language.getText("research.krulanguagebasics.name"), "krulanguagebasics");
            krulanguagebasics.prerequisiteresearch.push(kruintro);
            krulanguagebasics.timerequired = 240;
            ResearchService.definitions.push(krulanguagebasics);

            var powercrystals = new ResearchDefinition(Language.getText("research.powercrystals.name"), "powercrystals");
            powercrystals.prerequisitediscoveries.push({ id: "powercrystals" });
            powercrystals.crewrequired = 5;
            powercrystals.timerequired = 300;
            ResearchService.definitions.push(powercrystals);

            var weatherpatterns = new ResearchDefinition(Language.getText("research.weatherpatterns.name"), "weatherpatterns");
            weatherpatterns.prerequisitebuildings.push({ id: "communicationsarray" });
            weatherpatterns.crewrequired = 2;
            weatherpatterns.timerequired = 120;
            ResearchService.definitions.push(weatherpatterns);

            var communicationsarrayboost = new ResearchDefinition(Language.getText("research.communicationsarrayboost.name"), "communicationsarrayboost");
            communicationsarrayboost.prerequisitebuildings.push({ id: "communicationsarray" });
            communicationsarrayboost.crewrequired = 5;
            communicationsarrayboost.timerequired = 200;
            ResearchService.definitions.push(communicationsarrayboost);

            var alienshipdatadevice = new ResearchDefinition(Language.getText("research.alienshipdatadevice.name"), "alienshipdatadevice");
            alienshipdatadevice.unlockcondition = (game) => { return game.discoveries.some(d => d.definition.id == "shiplocation" && d.iscomplete()) };
            alienshipdatadevice.crewrequired = 2;
            alienshipdatadevice.timerequired = 200;
            ResearchService.definitions.push(alienshipdatadevice);

            var aliencrash = new ResearchDefinition(Language.getText("research.aliencrash.name"), "aliencrash");
            aliencrash.prerequisiteresearch.push(alienshipdatadevice);
            aliencrash.crewrequired = 2;
            aliencrash.timerequired = 200;
            aliencrash.postrender = (game, html, building) => {
                if (!game.inventory.datadevices) {
                    var poweredText = (game.inventory.datadevices > 0 ? "" : Language.getText("ui.heading.nodevices"));
                    var powered = " <span>(" + poweredText + ")</span>";
                    var title = $(html).find(".researchHeader");
                    var orgTitle = $(title).html();
                    var titleHTML = title.append(powered).html();
                    $(title).html(titleHTML);
                    var replaced = $(html).html().replace(orgTitle, titleHTML);
                    html = replaced;
                }
                return html;
            }
            aliencrash.onupdate = (game, research) => {
                if (game.inventory.datadevices > 0) {
                    if (Math.random() * 100 < 20) {
                        game.inventory.datadevices--;
                    }
                }
                else {
                    research.timeproduced--;
                }
                return game;
            };
            ResearchService.definitions.push(aliencrash);

            var aliencargo = new ResearchDefinition(Language.getText("research.aliencargo.name"), "aliencargo");
            aliencargo.prerequisiteresearch.push(aliencrash);
            aliencargo.crewrequired = 2;
            aliencargo.timerequired = 200;
            aliencargo.onupdate = (game, research) => {
                if (game.inventory.datadevices > 0) {
                    if (Math.random() * 100 < 20) {
                        game.inventory.datadevices--;
                    }
                }
                else {
                    research.timeproduced--;
                }
                return game;
            };
            ResearchService.definitions.push(aliencargo);

            var kruattitude = new ResearchDefinition(Language.getText("research.kruattitude.name"), "kruattitude");
            kruattitude.prerequisiteresearch.push(krulanguagebasics);
            kruattitude.timerequired = 300;
            ResearchService.definitions.push(kruattitude);

        }

        return ResearchService.definitions;
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
            var discoveriesReqsMet = researchDefinition.prerequisitediscoveries.every(d => game.discoveries.some(gd => gd.definition.id == d.id && gd.iscomplete()));
            var unlocked = researchDefinition.unlockcondition(game);

            if (!completed && researchReqsMet && buildingsReqsMet && discoveriesReqsMet && unlocked) {
                availableResearchDefinitions.push(researchDefinition);
            }
        }
        return availableResearchDefinitions;
    }
}

