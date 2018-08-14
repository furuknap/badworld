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
        wakeup.unlockelements = ".buildingControls, .details, .messagemenu";
        this.entities.push(wakeup);


        var largerHut = new StoryElement("", 4, "largerhut");
        largerHut.prerequisitebuildings = Services.BuildingService.allDefinitions().filter(b => b.id == "largerhut");
        this.entities.push(largerHut);

        var surroundings = new StoryElement("", 5, "surroundings");
        surroundings.prerequisiteresearch = Services.ResearchService.allDefinitions().filter(b => b.id == "surroundings");
        this.entities.push(surroundings);

        var junglenoises = new StoryElement("", 6, "junglenoises");
        junglenoises.prerequisitebuildings = Services.BuildingService.allDefinitions().filter(b => b.id == "firsthut");
        junglenoises.unlockcondition = function (game) { return Math.random() * 100 < 2 || game.research.some(r => r.definition.id == "safeShelter") };
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

        var roadtoalienship = new StoryElement("", 12, "roadtoalienship");
        roadtoalienship.prerequisitediscoveries = Services.DiscoveryService.allDefinitions().filter(b => b.id == "shiplocation");
        this.entities.push(roadtoalienship);

        var medicinalplants = new StoryElement("", 13, "medicinalplants");
        medicinalplants.prerequisitediscoveries.push({ id: "medicinalplants" });
        this.entities.push(medicinalplants);

        var medicinalplants = new StoryElement("", 14, "medicinalplantsbase");
        medicinalplants.prerequisiteresearch.push({ id: "medicinalplantsbase" });
        this.entities.push(medicinalplants);

        var kruattackfirst = new StoryElement("", 15, "kruattackfirst");
        kruattackfirst.unlockcondition = (game) => { return game.attacks.count > 0 && !game.texts.some(t => t.id == 15) }
        this.entities.push(kruattackfirst);

        var kruattacksecond = new StoryElement("", 16, "kruattacksecond");
        kruattacksecond.unlockcondition = (game) => { return game.attacks.count > 1 && !game.texts.some(t => t.id == 16) }
        this.entities.push(kruattacksecond);

        var krucapture = new StoryElement("", 17, "krucapture");
        krucapture.prerequisiteresearch = Services.ResearchService.allDefinitions().filter(b => b.id == "krucapture");
        this.entities.push(krucapture);

        var medkitsout = new StoryElement("", 18, "medkitsout");
        medkitsout.unlockcondition = (game) => { return game.buildings.some(b => b.definition.id == "medicalstation" && b.iscomplete()) && game.inventory.medkits == 0; }
        this.entities.push(medkitsout);

        var medkitsout = new StoryElement("", 19, "medkitsoutneedresearch");
        medkitsout.unlockcondition = (game) => {
            return (!game.research.some(r => r.definition.id == "medkit") && game.texts.some(t => t.id == 18) && game.inventory.medkits == 0);
        }
        this.entities.push(medkitsout);

        var medkits = new StoryElement("", 20, "medkits");
        medkits.prerequisiteresearch = Services.ResearchService.allDefinitions().filter(r => r.id == "medkit");
        this.entities.push(medkits);

        var medkitsoutcanbuild = new StoryElement("", 21, "medkitsoutcanbuild");
        medkitsoutcanbuild.unlockcondition = (game) => { return game.buildings.some(b => b.definition.id == "sickbay" && b.iscomplete()) && game.inventory.medkits == 0; }
        this.entities.push(medkitsoutcanbuild);

        var krucaptured = new StoryElement("", 22, "krucaptured");
        krucaptured.unlockcondition = (game) => { return game.state.krucaptive; };
        this.entities.push(krucaptured);

        var kruintro = new StoryElement("", 23, "kruintro");
        kruintro.prerequisiteresearch.push({ id: "kruintro" });
        this.entities.push(kruintro);

        var krunonaggressive = new StoryElement("", 24, "krunonaggressive");
        krunonaggressive.unlockcondition = (game) => { return game.attacks.count > 5; };
        this.entities.push(krunonaggressive);

        var krulanguagebasics = new StoryElement("", 25, "krulanguagebasics");
        krulanguagebasics.prerequisiteresearch = Services.ResearchService.allDefinitions().filter(r => r.id == "krulanguagebasics");
        this.entities.push(krulanguagebasics);

        var antennafound = new StoryElement("", 26, "antennafound");
        antennafound.unlockcondition = (game) => { return game.state.antennafound; }
        this.entities.push(antennafound);

        var antennarecovered = new StoryElement("", 27, "antennarecovered");
        antennarecovered.prerequisitediscoveries = Services.DiscoveryService.allDefinitions().filter(b => b.id == "antenna");
        this.entities.push(antennarecovered);

        var medicalstation = new StoryElement("", 28, "communicationsarray");
        medicalstation.prerequisitebuildings.push({ id: "communicationsarray" });
        this.entities.push(medicalstation);

        var powercrystalsintro = new StoryElement("", 29, "powercrystalsintro");
        powercrystalsintro.unlockcondition = (game) => { return game.state.powercrystalsfound; }
        this.entities.push(powercrystalsintro);

        var powercrystalscompleted = new StoryElement("", 30, "powercrystalscompleted");
        powercrystalscompleted.prerequisitediscoveries.push({ id: "powercrystals" });
        this.entities.push(powercrystalscompleted);

        var weatherpatterns = new StoryElement("", 31, "weatherpatterns");
        weatherpatterns.prerequisiteresearch.push({ id: "weatherpatterns" });
        this.entities.push(weatherpatterns);

        var communicationsarrayboosterintro = new StoryElement("", 32, "communicationsarrayboosterintro");
        communicationsarrayboosterintro.prerequisiteresearch.push({ id: "communicationsarrayboost" });
        this.entities.push(communicationsarrayboosterintro);

        var messagesentpart1 = new StoryElement("", 33, "messagesentpart1");
        messagesentpart1.unlockcondition = (game) => { return game.state.earthmessagesent; }
        this.entities.push(messagesentpart1);

        var messagesentpart2 = new StoryElement("", 34, "messagesentpart2");
        messagesentpart2.unlockcondition = (game) => { return game.texts.some(t => t.id == 33); }
        this.entities.push(messagesentpart2);

        var messagesentpart3 = new StoryElement("", 35, "messagesentpart3");
        messagesentpart3.unlockcondition = (game) => { return game.texts.some(t => t.id == 34); }
        this.entities.push(messagesentpart3);

        var messagesentpart4 = new StoryElement("", 36, "messagesentpart4");
        messagesentpart4.unlockcondition = (game) => { return game.texts.some(t => t.id == 35); }
        this.entities.push(messagesentpart4);

        var communicationsalmostdone = new StoryElement("", 37, "communicationsalmostdone");
        communicationsalmostdone.unlockcondition = (game) => { return game.buildings.find(b => b.definition.id == "communicationsarray") != undefined && game.buildings.find(b => b.definition.id == "communicationsarray").charge > 8000; }
        this.entities.push(communicationsalmostdone);

        var communicationshalfway = new StoryElement("", 38, "communicationshalfway");
        communicationshalfway.unlockcondition = (game) => { return game.buildings.find(b => b.definition.id == "communicationsarray") != undefined && game.buildings.find(b => b.definition.id == "communicationsarray").charge > 5000; }
        this.entities.push(communicationshalfway);

        var alienshipdatadevice = new StoryElement("", 39, "alienshipdatadevice");
        alienshipdatadevice.prerequisiteresearch.push({ id: "alienshipdatadevice" });
        this.entities.push(alienshipdatadevice);

        var aliencrash1 = new StoryElement("", 40, "aliencrash1");
        aliencrash1.prerequisiteresearch.push({ id: "aliencrash" });
        this.entities.push(aliencrash1);

        var aliencrash2 = new StoryElement("", 41, "aliencrash2");
        aliencrash2.unlockcondition = (game) => { return game.texts.some(t => t.id == 40); }
        this.entities.push(aliencrash2);

        var aliencargo1 = new StoryElement("", 42, "aliencargo1");
        aliencargo1.prerequisiteresearch.push({ id: "aliencargo" });
        this.entities.push(aliencargo1);

        var aliencargo2 = new StoryElement("", 43, "aliencargo2");
        aliencargo2.unlockcondition = (game) => { return game.texts.some(t => t.id == 42); }
        this.entities.push(aliencargo2);

        var krulanguagebasics2 = new StoryElement("", 44, "krulanguagebasics2");
        krulanguagebasics2.unlockcondition = (game) => { return game.texts.some(t => t.id == 25); }
        this.entities.push(krulanguagebasics2);

        var kruattitude = new StoryElement("", 45, "kruattitude");
        kruattitude.prerequisiteresearch = Services.ResearchService.allDefinitions().filter(r => r.id == "kruattitude");
        this.entities.push(kruattitude);

        var krudefenses = new StoryElement("", 46, "krudefenses");
        krudefenses.prerequisiteresearch = [{ id: "kruattitude" }, { id: "alienshipdatadevice" }];
        this.entities.push(krudefenses);

        var dronecontrol = new StoryElement("", 47, "dronecontrol");
        dronecontrol.prerequisitebuildings.push({ id: "dronecontrol" });
        dronecontrol.unlockcondition = (game) => { return game.inventory.powercrystals > 0; }
        this.entities.push(dronecontrol);

        var campwiped = new StoryElement("", 48, "campwiped");
        campwiped.unlockcondition = (game) => { return game.state.campwiped && Services.CrewService.getAvailable(game) > 0; }
        this.entities.push(campwiped);

        var campwipedguards = new StoryElement("", 49, "campwipedguards");
        campwipedguards.prerequisitebuildings.push({ id: "krudefenses" });
        campwipedguards.unlockcondition = (game) => { return game.state.campwiped && Services.CrewService.getAvailable(game) > 0; }
        this.entities.push(campwipedguards);

        var angrycrewwounded1 = new StoryElement("", 50, "angrycrewwounded1");
        angrycrewwounded1.unlockcondition = (game) => { return game.crew.sick >= 10; }
        this.entities.push(angrycrewwounded1);

        var angrycrewwounded2 = new StoryElement("", 51, "angrycrewwounded2");
        angrycrewwounded2.unlockcondition = (game) => { return game.crew.sick >= 20 && game.texts.some(t => t.id == 50); }
        this.entities.push(angrycrewwounded2);

        var angrycrewwounded3 = new StoryElement("", 52, "angrycrewwoundedleave");
        angrycrewwounded3.unlockcondition = (game) => { return game.crew.sick >= 22 && game.texts.some(t => t.id == 51); }
        this.entities.push(angrycrewwounded3);

        var rebeldead = new StoryElement("", 53, "rebeldead");
        rebeldead.unlockcondition = (game) => { return game.state.rebeldead; }
        this.entities.push(rebeldead);

        var movetohefnship1 = new StoryElement("", 54, "movetohefnship1");
        movetohefnship1.unlockcondition = (game) => { return game.state.earthmessagesent && game.texts.some(t => t.id == 36); }
        movetohefnship1.prerequisiteresearch = Services.ResearchService.allDefinitions().filter(r => r.id == "krulanguagebasics");
        this.entities.push(movetohefnship1);

        var movetohefnship2 = new StoryElement("", 55, "movetohefnship2");
        movetohefnship2.unlockcondition = (game) => { return game.texts.some(t => t.id == 54); }
        this.entities.push(movetohefnship2);

        var movetohefnship3 = new StoryElement("", 56, "movetohefnship3");
        movetohefnship3.unlockcondition = (game) => { return game.texts.some(t => t.id == 55); }
        this.entities.push(movetohefnship3);

        var movetohefnship4 = new StoryElement("", 57, "movetohefnship4");
        movetohefnship4.unlockcondition = (game) => { return game.texts.some(t => t.id == 56); }
        this.entities.push(movetohefnship4);

        var part1complete = new StoryElement("", 58, "part1complete");
        part1complete.unlockcondition = (game) => { return game.texts.some(t => t.id == 59) && game.state.part1complete; }
        part1complete.unlockelements = ".credits";
        part1complete.part2 = true;
        this.entities.push(part1complete);

        var movetohefnship5 = new StoryElement("", 59, "movetohefnship5");
        movetohefnship5.unlockcondition = (game) => { return game.texts.some(t => t.id == 57) && game.state.part1complete; }
        movetohefnship5.part2 = true;
        this.entities.push(movetohefnship5);


    }

    updateGame(game, deltaTime) {
        var textsToTest = this.entities.filter(t => !game.texts.some(gt => gt.id == t.id)).sort((a, b) => { return a.id==b.id; });

        if (game.state.part1complete) {
            textsToTest = textsToTest.filter(t => t.part2);
        }

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
