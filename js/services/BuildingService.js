import { GameService } from "./gameService.js"
import * as Services from "./services.js"
import { Building } from "../entities/Building.js";
import { BuildingDefinition } from "../entities/Building.js";
import { Language } from "../utilities/LanguageUtilities.js";
import { Notification } from "../entities/entities.js";

export class BuildingService extends GameService {

    updateGame(game, deltaTime) {
        for (var i = 0; i < game.buildings.length; i++) {
            var building = game.buildings[i];


            if (building.damage <= 0) {
                var wascomplete = building.iscomplete;
                game = building.definition.onupdate(game, building);
                if (building.inprogress && !building.iscomplete()) {
                    building.timeproduced += deltaTime;
                    if (building.iscomplete() && !building.wascomplete) {
                        game = building.definition.completed(game);
                    }
                }
            }
            else {
                building.damage -= Math.max(1, parseInt(Services.CrewService.getAvailable(game) * 0.1));
                if (building.damage == 0) {
                    game.notifications.push(new Notification("ui.notifications.buildingrepaired", null, 5));
                }
            }
        }
        return game;
    }

    static availableDefinitions(game) {
        var availableDefinitions = [];
        var allBuildingDefinitions = this.allDefinitions();
        for (var i = 0; i < allBuildingDefinitions.length; i++) {
            var definition = allBuildingDefinitions[i];
            var completed = game.buildings.some(gb => gb.definition.id == definition.id && (gb.iscomplete() || gb.inprogress));
            var researchReqsMet = definition.prerequisiteresearch.every(r => game.research.some(gr => gr.definition.id == r.id && gr.iscomplete()));
            var buildingsReqsMet = definition.prerequisitebuildings.every(b => game.buildings.some(gb => gb.definition.id == b.id && gb.iscomplete()));

            var shipReqsMet = definition.prerequisiteshipresearch.every(s => game.shipresearch.some(gs => gs.definition.id == s.id && gs.iscomplete()));
            var unlocked = definition.unlockcondition(game);

            if (!completed && researchReqsMet && buildingsReqsMet && unlocked) {
                availableDefinitions.push(definition);
            }
        }
        return availableDefinitions;
    }

    static allDefinitions() {
        if (BuildingService.buildingdefinitions == undefined || BuildingService.buildingdefinitions.length == 0) {
            BuildingService.buildingdefinitions = [];
            var hut = new BuildingDefinition(Language.getText("building.hut.name"));
            hut.id = "firsthut";
            hut.timerequired = 5;
            BuildingService.buildingdefinitions.push(hut);

            var largerHut = new BuildingDefinition(Language.getText("building.largerhut.name"));
            largerHut.id = "largerhut";
            largerHut.prerequisitebuildings.push(hut)
            largerHut.timerequired = 15;
            largerHut.crewrequired = 3;
            largerHut.unlockelements = ".researchControls"
            BuildingService.buildingdefinitions.push(largerHut);

            var medicalStation = new BuildingDefinition(Language.getText("building.medicalstation.name"));
            medicalStation.id = "medicalstation";
            medicalStation.crewrequired = 0;
            medicalStation.unlockcondition = function (game) { return game.crew.sick > 0; }
            medicalStation.timerequired = 30;
            medicalStation.unlockelements = ".inventoryControls";
            medicalStation.postrender = function (game) { return game };
            medicalStation.completed = (game) => { game.inventory.medkits = 5; return game; }
            medicalStation.onupdate = function (game) {
                if (game.crew.sick > 0) {
                    var baseOdds = 0.5;
                    if (game.research.some(r => r.id == "medicinalplantsbase" && r.iscomplete())) {
                        baseOdds *= 3;
                    }
                    if (game.inventory.medkits > 0) {
                        baseOdds *= 2;
                    }

                    if (Math.random() * 100 < baseOdds) {
                        Services.CrewService.changeWounded(game, -1);
                        if (game.inventory.medkits > 0) {
                            game.inventory.medkits--;
                        }
                    }

                }
                return game;
            };
            BuildingService.buildingdefinitions.push(medicalStation);

            var kruCage = new BuildingDefinition(Language.getText("building.krucage.name"));
            kruCage.id = "krucage";
            kruCage.crewrequired = 2;
            kruCage.timerequired = 60;
            kruCage.prerequisiteresearch.push({ id: "krucapture" });
            BuildingService.buildingdefinitions.push(kruCage);

            var sickbay = new BuildingDefinition(Language.getText("building.sickbay.name"));
            sickbay.id = "sickbay";
            sickbay.timerequired = 240;
            sickbay.crewrequired = 2;
            sickbay.prerequisiteresearch.push({ id: "medicinalplantsbase" });
            sickbay.onupdate = function (game, building) {
                if (game.crew.sick > 0) {
                    var baseOdds = 4;

                    if (game.inventory.medkits > 0) {
                        baseOdds *= 2;
                    }

                    if (Math.random() * 100 < baseOdds) {
                        Services.CrewService.changeWounded(game, -1);
                        if (game.inventory.medkits > 0) {
                            game.inventory.medkits--;
                        }
                    }
                }
                var medkitOdds = 10;
                if (Math.random() * 100 < medkitOdds && game.inventory.medicinalplants>0 && building.iscomplete()) {
                    game.inventory.medkits++;
                    game.inventory.medicinalplants--;
                }


                return game;
            };
            BuildingService.buildingdefinitions.push(sickbay);


        }

        return BuildingService.buildingdefinitions;
    }


    static startBuilding(game, definitionID) {
        var foundDefinition;
        for (var i = 0; i < this.availableDefinitions(game).length; i++) {
            var r = this.availableDefinitions(game)[i];
            if (r.id == definitionID) {
                foundDefinition = r;
                break;
            }
        }
        if (typeof foundDefinition != typeof undefined) {
            if (foundDefinition.crewrequired <= Services.CrewService.getAvailable(game)) {
                var building = Building.getFromDefintion(foundDefinition);
                building.inprogress = true;
                game = building.definition.onstart(game);
                game.buildings.push(building);
            }
            else {
                game.notifications.push(new Notification("notenoughcrewavailable"));
            }
        }
    }
}
