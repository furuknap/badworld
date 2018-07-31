import { GameService } from "./gameService.js"
import * as Services from "./services.js"
import { StoryElement } from "../entities/StoryElement.js";
import { Language } from "../utilities/LanguageUtilities.js";


export class StoryService extends GameService {
    constructor(language) {
        super();
        this.Language = new Language();

        this.entities = [
            new StoryElement("", 1, "intro")

        ];

        var firstHut = new StoryElement("", 3, "firsthut");
        firstHut.prerequisitebuildings = Services.BuildingService.allDefinitions().filter(b => b.id == "firsthut");
        this.entities.push(firstHut);

        var wakeup = new StoryElement("", 2, "wakeup");
        wakeup.unlockcondition = function (game) { return !game.startGame; }
        wakeup.unlockelements = ".buildingControls, .details";
        this.entities.push(wakeup);


        var largerHut = new StoryElement("", 4, "largerhut");
        largerHut.prerequisitebuildings = Services.BuildingService.allDefinitions().filter(b => b.id == "largerhut");
        this.entities.push(largerHut);

        var surroundings = new StoryElement("", 5, "surroundings");
        surroundings.prerequisiteresearch = Services.ResearchService.allDefinitions().filter(b => b.id == "surroundings");
        this.entities.push(surroundings);

        var junglenoises = new StoryElement("", 6, "junglenoises");
        junglenoises.prerequisitebuildings = Services.BuildingService.allDefinitions().filter(b => b.id == "firsthut");
        junglenoises.unlockcondition = function () { return Math.random() * 100 < 2 };
        this.entities.push(junglenoises);

        var junglenoises2 = new StoryElement("", 7, "junglenoises2");
        junglenoises2.unlockcondition = function (game) { return game.texts.some(t => t.id == 6) && Math.random() * 100 < 5 };
        junglenoises2.unlockelements = ".questsControls, .discoveryControls";
        this.entities.push(junglenoises2);

        var firstwounded = new StoryElement("", 8, "firstwounded");
        firstwounded.unlockcondition = function (game) { return !game.texts.some(t => t.id == 8) && game.crew.sick > 0; };
        firstwounded.unlockelements = ".actionsControls";
        this.entities.push(firstwounded);

        var medicalstation = new StoryElement("", 9, "medicalstation");
        medicalstation.prerequisitebuildings = Services.BuildingService.allDefinitions().filter(b => b.id == "medicalstation");
        this.entities.push(medicalstation);

        var sourceofnoises = new StoryElement("", 10, "sourceofnoises");
        sourceofnoises.prerequisitediscoveries = Services.DiscoveryService.allDefinitions().filter(b => b.id == "noisesintro");
        this.entities.push(sourceofnoises);

        var directionofalienship = new StoryElement("", 11, "directionofalienship");
        directionofalienship.prerequisitediscoveries = Services.DiscoveryService.allDefinitions().filter(b => b.id == "shipintro");
        this.entities.push(directionofalienship);

    }

    updateGame(game, deltaTime) {
        var textsToTest = this.entities.filter(t => !game.texts.some(gt => gt.id == t.id));

        for (var i = 0; i < textsToTest.length; i++) {
            var text = textsToTest[i];
            var researchReqsMet = text.prerequisiteresearch.every(r => game.research.some(gr => gr.definition.id == r.id && gr.iscomplete()));
            var buildingsReqsMet = text.prerequisitebuildings.every(b => game.buildings.some(gb => gb.definition.id == b.id && gb.iscomplete()));
            var shipReqsMet = text.prerequisiteshipresearch.every(s => game.shipresearch.some(gs => gs.definition.id == s.id && gs.iscomplete()));
            var discoveriesReqsMet = text.prerequisitediscoveries.every(d => game.discoveries.some(gd => gd.definition.id == d.id && gd.iscomplete()));
            var unlocked = text.unlockcondition(game);
            if (discoveriesReqsMet && researchReqsMet && buildingsReqsMet && shipReqsMet && unlocked) {
                game.texts.push(text);
            }

        }

        return game;
    }
}
