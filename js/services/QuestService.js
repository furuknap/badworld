import { GameService } from "./gameService.js"
import { Quest } from "../entities/Quest.js"
import * as Services from "./services.js"
import { QuestDefinition } from "../entities/Quest.js"
import { Language } from "../utilities/LanguageUtilities.js";
import { Notification } from "../entities/entities.js";

export class QuestService extends GameService {
    updateGame(game, deltaTime) {
        var completedQuestIndexes = [];
        for (var i = 0; i < game.quests.length; i++) {
            var quest = game.quests[i];
            var wascomplete = quest.iscomplete;
            if (quest.inprogress && !quest.iscomplete()) {
                quest.timeproduced += deltaTime;
                game = quest.definition.onupdate(game, quest);
                if (quest.iscomplete() && !quest.wascomplete) {
                    game = quest.definition.completed(game, quest);
                }
            }
        }

        for (var i = 0; i < game.quests.length; i++) {
            if (game.quests[i].iscomplete()) {
                completedQuestIndexes.push(i);
            }
        }

        for (var i = 0; i < completedQuestIndexes.length; i++) {
            game.quests.splice(completedQuestIndexes[i], 1);
        }

        return game;
    }

    static startQuest(game, definitionID) {
        var foundDefinition;
        for (var i = 0; i < this.availableDefinitions(game).length; i++) {
            var e = this.availableDefinitions(game)[i];
            if (e.id == definitionID) {
                foundDefinition = e;
                break;
            }
        }
        if (typeof foundDefinition != typeof undefined) {
            if (foundDefinition.crewrequired <= Services.CrewService.getAvailable(game)) {
                var quest = Quest.getFromDefintion(foundDefinition);
                quest.inprogress = true;
                quest.crew = foundDefinition.crewrequired;
                game = quest.definition.onstart(game);
                game.quests.push(quest);
            }
            else {
                game.notifications.push(new Notification("notenoughcrewavailable"));
            }
        }
    }

    static getCrewAllocated(game) {
        var allocated = 0;
        for (var i = 0; i < game.quests.length; i++) {
            allocated += game.quests[i].crew;
        }
        return allocated;
    }

    static allDefinitions() {
        if (QuestService.definitions == undefined || QuestService.definitions.length == 0) {
            QuestService.definitions = [];
            var investigateJungle = new QuestDefinition("", 1, 30);
            investigateJungle.unlockcondition = function (game) { return game.texts.some(t => t.id == 7); };
            investigateJungle.name = Language.getText("quest.nearbyjungle.name");
            investigateJungle.onupdate = (game, quest) => {
                var baseWoundedOdds = 2;
                var medicinalPlantsOdds = 3;
                if (game.research.some(r => r.definition.id == "medicinalplants" && r.iscomplete())) {
                    baseWoundedOdds/=2;
                }

                if (Math.random() * 100 < baseWoundedOdds) {
                    game.crew.sick++;
                    quest.crew--;
                    if (quest.crew <= 0) {
                        game = quest.definition.cancel(game, quest);
                        game.notifications.push(new Notification("quest.cancelled", null, 5));
                    }
                }
                if (Math.random() * 100 < 5) {
                    Services.DiscoveryService.addPoints(game, parseInt(Math.random() * 3));
                    
                }
                if (game.buildings.some(b => b.definition.id == "sickbay" && b.iscomplete())) {
                    if (Math.random() * 100 < medicinalPlantsOdds) {
                        game.inventory.medicinalplants++;
                    }
                }

                return game;
            }
            QuestService.definitions.push(investigateJungle);


            var deeperJungle = new QuestDefinition("", 2, 120);
            deeperJungle.crewrequired = 3;
            deeperJungle.unlockcondition = function (game) {
                return game.discoveries.some(t => (t.definition.id == "shipintro" || t.definition.id == "sourceofnoises") && t.iscomplete())
            };
            deeperJungle.name = Language.getText("quest.deeperjungle.name");
            deeperJungle.onupdate = (game, quest) => {
                var baseWoundedOdds = 3;
                if (game.research.some(r => r.definition.id == "medicinalplants" && r.iscomplete())) {
                    baseWoundedOdds/=2;
                }
                if (Math.random() * 100 < baseWoundedOdds) {
                    game.crew.sick++;
                    quest.crew--;
                    if (quest.crew <= 0) {
                        game = quest.definition.cancel(game, quest);
                        game.notifications.push(new Notification("quest.cancelled", null, 5));
                    }
                }
                if (Math.random() * 100 < 7) {
                    Services.DiscoveryService.addPoints(game, parseInt(Math.random() * 5));

                }


                return game;
            }
            QuestService.definitions.push(deeperJungle);



        }

        return QuestService.definitions;
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
            var unlocked = definition.unlockcondition(game);

            if (!completed && researchReqsMet && buildingsReqsMet && unlocked) {
                availableDefinitions.push(definition);
            }
        }
        return availableDefinitions;
    }
}

