import { GameService } from "./gameService.js"
import { Building } from "../entities/Building.js";
import { BuildingDefinition } from "../entities/Building.js";
import { Language } from "../utilities/LanguageUtilities.js";

export class BuildingService extends GameService {

    updateGame(game, deltaTime) {
        for (var i = 0; i < game.buildings.length; i++) {
            var building = game.buildings[i];
            var wascomplete = building.iscomplete;
            game = building.definition.onupdate(game);
            if (building.inprogress && !building.iscomplete()) {
                building.timeproduced += deltaTime;
                game = building.definition.onupdate(game);
                if (building.iscomplete() && !building.wascomplete) {
                    game = building.definition.completed(game);
                }
            }
        }
        return game;
    }

    static availableBuildingDefinitions(game) {
        var availableBuildingDefinitions = [];
        var allBuildingDefinitions = this.allDefinitions();
        for (var i = 0; i < allBuildingDefinitions.length; i++) {
            var buildingDefinition = allBuildingDefinitions[i];
            var completed = game.buildings.some(gb => gb.definition.id == buildingDefinition.id && (gb.iscomplete() || gb.inprogress));
            var researchReqsMet = buildingDefinition.prerequisiteresearch.every(r => game.research.some(gr => gr.definition.id == r.id && gr.iscomplete()));
            var buildingsReqsMet = buildingDefinition.prerequisitebuildings.every(b => game.buildings.some(gb => gb.definition.id == b.id && gb.iscomplete()));

            var shipReqsMet = buildingDefinition.prerequisiteshipresearch.every(s => game.shipresearch.some(gs => gs.definition.id == s.id && gs.iscomplete()));
            var unlocked = buildingDefinition.unlockcondition(game);

            if (!completed && researchReqsMet && buildingsReqsMet && unlocked) {
                availableBuildingDefinitions.push(buildingDefinition);
            }
        }
        return availableBuildingDefinitions;
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
            medicalStation.unlockcondition = function (game) { return game.crew.sick > 0;  }
            medicalStation.timerequired = 30;
            medicalStation.postrender = function (game) { return game };
            medicalStation.onupdate = function (game) {
                if (game.crew.sick > 0) {
                    var baseOdds = 0.5;
                    if (game.research.some(r => r.id == "medicinalplantsbase" && r.iscomplete())) {
                        baseOdds *= 3;
                    }

                    if (Math.random() * 100 < 0.5) {
                        game.crew.sick--;
                        game.crew.available++;
                    }
                }
                return game;
            };
            BuildingService.buildingdefinitions.push(medicalStation);

        }

        return BuildingService.buildingdefinitions;
    }


    static startBuilding(game, definitionID) {
        var foundDefinition;
        for (var i = 0; i < this.availableBuildingDefinitions(game).length; i++) {
            var r = this.availableBuildingDefinitions(game)[i];
            if (r.id == definitionID) {
                foundDefinition = r;
                break;
            }
        }
        if (typeof foundDefinition != typeof undefined) {
            if (foundDefinition.crewrequired <= game.crew.available) {
                var building = Building.getFromDefintion(foundDefinition);
                building.inprogress = true;
                game = building.definition.onstart(game);
                game.buildings.push(building);
            }
            else {
                game.notifications.push(new Notification(Language.getText("notenoughcrewavailable")));
            }
        }
    }
}
