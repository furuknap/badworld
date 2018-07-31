import { GameService } from "./gameService.js"
import { Quest } from "../entities/Quest.js"
import * as Services from "./services.js"
import { QuestDefinition } from "../entities/Quest.js"
import { Language } from "../utilities/LanguageUtilities.js";

export class QuestService extends GameService {
    updateGame(game, deltaTime) {
        var completedQuestIndexes = [];
        for (var i = 0; i < game.quests.length; i++) {
            var quest = game.quests[i];
            var wascomplete = quest.iscomplete;
            if (quest.inprogress && !quest.iscomplete()) {
                quest.timeproduced += deltaTime;
                game = quest.definition.onupdate(game);
                if (quest.iscomplete() && !quest.wascomplete) {
                    game = quest.definition.completed(game);
                    completedQuestIndexes.push(i);
                }
            }
        }
        for (var i = 0; i < completedQuestIndexes.length; i++) {
            game.quests.splice(completedQuestIndexes[i], 1);
        }

        return game;
    }

    static startQuest(game, definitionID) {
        var foundRefinition;
        for (var i = 0; i < this.availableDefinitions(game).length; i++) {
            var e = this.availableDefinitions(game)[i];
            if (e.id == definitionID) {
                foundRefinition = e;
                break;
            }
        }
        if (typeof foundRefinition != typeof undefined) {
            if (r.crewrequired <= game.crew.available) {
                var quest = Quest.getFromDefintion(foundRefinition);
                quest.inprogress = true;
                game = quest.definition.onstart(game);
                game.quests.push(quest);
            }
            else {
                game.notifications.push(new Notification(Language.getText("notenoughcrewavailable")));
            }
        }
    }

    static allDefinitions() {
        if (QuestService.definitions == undefined || QuestService.definitions.length == 0) {
            QuestService.definitions = [];
            var investigateJungle = new QuestDefinition("", 1, 30);
            investigateJungle.unlockcondition = function (game) { return game.texts.some(t => t.id == 7); };
            investigateJungle.completed = (game) => { game.crew.available++; game.crew.quest--; return game; };
            investigateJungle.onstart = (game) => { game.crew.available--; game.crew.quest++; return game; };
            investigateJungle.unlockelements = ".deeperJungleQuest";
            investigateJungle.name = "Scout Nearby Jungle";
            investigateJungle.onupdate = (game) => {
                if (Math.random() * 100 < 2) {
                    game.crew.available--;
                    game.crew.sick++;
                }
                if (Math.random() * 100 < 5) {
                    Services.DiscoveryService.addPoints(game, parseInt(Math.random() * 3));
                    
                }


                return game;
            }

            QuestService.definitions.push(investigateJungle);
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

