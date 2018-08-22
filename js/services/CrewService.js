import { GameService } from "./gameService.js"
import { Quest } from "../entities/Quest.js"
import * as Services from "./services.js"
import { QuestDefinition } from "../entities/Quest.js"
import { Language } from "../utilities/LanguageUtilities.js";
import { Notification } from "../entities/entities.js";

export class CrewService extends GameService {
    updateGame(game, deltaTime) {
        if (game.crew.guards == undefined) {
            game.crew.guards = 0;
        }
        if (game.crew.research == undefined) {
            game.crew.research = 0;
        }
        if (game.crew.manufacturing == undefined) {
            game.crew.manufacturing = 0;
        }
        if (game.crew.gathering== undefined) {
            game.crew.gathering = 0;
        }
        return game;
    }



    static getTotalCrew(game) {
        var totalcrew = 25;
        if (game.texts.some(t => t.id == 51)) {
            totalcrew--;
        }

        return totalcrew;
    }
    static getAvailable(game) {
        return CrewService.getTotalCrew(game) - (Services.QuestService.getCrewAllocated(game) + game.crew.sick + game.crew.research + game.crew.building + game.crew.guards +
            game.crew.defense + game.crew.repair + game.crew.gathering
            );
    }
    static getExpedition(game) {
        return Services.QuestService.getCrewAllocated(game);
    }
    static getSick(game) {
        return game.crew.sick;
    }
    static changeResearch(game, count) {
        game.crew.research += count;
        return game;
    }
    static changeWounded(game, count) {
        game.crew.sick += count;
        return game;
    }
    static changeBuilding(game, count) {
        game.crew.building += count;
        return game;
    }
    static changeGuards(game, count) {
        if (CrewService.getAvailable(game) >= count && game.crew.guards+count>=0) {
            game.crew.guards += count;
        }
        return game;
    }

    static changeResearchers(game, count) {
        if (CrewService.getAvailable(game) >= count && game.crew.research + count >= 0) {
            game.crew.research += count;
        }
        return game;
    }

}
