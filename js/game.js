var game = {}
var updateInterval = 1;
var saveInterval = 5;
var services = [];
var isRunningUpdates = false;
var pauseUpdates = false;
var runViewUpdates = true;
//region Selector
var researchAvailableListSelector = ".researchAvailableList";
var researchListSelector = ".researchList";
var buildingsAvailableListSelector = ".buildingsAvailableList";
var buildingsListSelector = ".buildingsList";
var questsAvailableListSelector = ".questsAvailableList";
var questsListSelector = ".questsList";

var discoveriesAvailableListSelector = ".discoveriesAvailableList";
var discoveriesPointsSelector = ".discoveriesList";

var detailsSelector = ".details";

import * as Services from "./services/services.js"
import * as Entities from "./entities/entities.js"
import * as Utilities from "./utilities/utilities.js"
import * as UI from "./ui/uielements.js"




$(document).ready(function () {
    Utilities.Language.load().done(function () {
        translateUI();
        setInterval(saveGame, saveInterval * 1000);
        setInterval(updateGame, updateInterval * 1000);

        loadGame();
        setupButtons();

        refreshView();
        registerServices();

    })



});

function registerServices() {

    services.push(new Services.BuildingService());
    services.push(new Services.ResearchService());
    services.push(new Services.StoryService());
    services.push(new Services.QuestService());
    services.push(new Services.DiscoveryService());
}
function setupButtons() {
    $(document).on("click", ".btnWakeUp", function () {
        game.night = false;
        game.startGame = false;
        refreshView();
    });

    $(document).on("click", ".resetGame", function () {
        if (confirm("Are you sure you want to reset the game?")) {
            deleteGame();
        }
    })

    $(document).on("click", ".toggleUpdates", function () {
        runViewUpdates = !runViewUpdates;
    })
    $(document).on("click", ".startResearchButton", function (sender) {
        var target = $(sender.target);
        var definitionid = target.data("researchdefinitionid");
        Services.ResearchService.startResearch(game, definitionid);
    })
    $(document).on("click", ".startBuildingButton", function (sender) {
        var target = $(sender.target);
        var definitionid = target.data("buildingdefinitionid");
        Services.BuildingService.startBuilding(game, definitionid);
    })
    $(document).on("click", ".startQuestButton", function (sender) {
        var target = $(sender.target);
        var definitionid = target.data("questdefinitionid");
        Services.QuestService.startQuest(game, definitionid);
    })
    $(document).on("click", ".setActiveDiscoveryButton", function (sender) {
        var target = $(sender.target);
        var definitionid = target.data("discoverydefinitionid");
        game = Services.DiscoveryService.setActiveDiscovery(game, definitionid);
    })

}

function translateUI() {
    $("[data-textid]").each(function (element) {
        var text = Utilities.Language.getText($(this).data("textid"));
        $(this).html(text);
    })
}

function updateGame() {
    if (!isRunningUpdates) {
        isRunningUpdates = true;
        var secondsSinceLastUpdate = parseInt((new Date().getTime() - game.lastupdate.getTime()) / 1000);
        if (secondsSinceLastUpdate > 60 * 60 * 24 * 6) {
            secondsSinceLastUpdate = 60 * 60 * 24 * 6;
        }
        for (var t = 0; t < secondsSinceLastUpdate; t++) {

            for (var i = 0; i < services.length; i++) {
                var service = services[i];
                game = service.updateGame(game, updateInterval);
            }
            game.lastupdate.setSeconds(game.lastupdate.getSeconds() + updateInterval);
        }
        isRunningUpdates = false;
    }
    else {
        console.log("Updates in progress...");
    }
    if (!pauseUpdates) {
        refreshView();
    }
}

function refreshView() {
    if (runViewUpdates) {
        if (game.startGame) {
            $(".btnWakeUp").removeClass("hidden").show();
        }
        else {
            $(".btnWakeUp").hide();
        }
        if (game.night) {
            $("").addClass("night");
        }
        else {
            $(".night").removeClass("night");
        }

        updateUnlockedElements();


        var messageHTML = "";
        game.texts.forEach(function (text) {
            var texto = Utilities.Language.getText(text.textid)
            messageHTML += "<div class=\"messageEntry\">" + texto + "</div>";
        });
        $("#messages").html(messageHTML);

        updateResearch();
        updateBuildings();
        updateQuests();
        updateDiscoveries();

        updateDetails();
        showNotifications();
    }

}

function showNotifications() {
    if (game.notifications.length > 0) {
        var notification = game.notifications[0];
        var notificationdate = new Date(notification.date);
        var nowdate = new Date();
        if (notificationdate.setSeconds(notificationdate.getSeconds() + notification.duration) > nowdate) {
            if (Object.keys(vex.getAll()).length == 0) {
                var buttons = [];
                notification.buttons.forEach((b) => {
                    buttons.push(
                        $.extend({}, vex.dialog.buttons.YES, {
                            className: 'vex-dialog-button-primary',
                            text: b.text,
                            click: function () { game.notifications.pop(); }
                        }),
                    );
                });
                vex.dialog.open({
                    message: Utilities.Language.getText(notification.textid),
                    buttons: buttons,
                });
            }
        }
        else {
            game.notifications.pop();
            vex.closeAll(); // Doesn't work because the outside if blocks execution if any vexes are open.
        }
    }
}


function updateDetails() {
    $(detailsSelector).html();
    var crewHTML = "<div>" +
        "<strong>" + Utilities.Language.getText("ui.heading.crew")+"</strong><br/>" +
        Utilities.Language.getText("ui.heading.crew.available") + ": " + game.crew.available + "<br/>" +
        (game.crew.sick > 0 ? Utilities.Language.getText("ui.heading.crew.wounded") +": " + game.crew.sick + "<br/>" : "") +
        (game.crew.quest > 0 ? Utilities.Language.getText("ui.heading.crew.quests") + ": " + game.crew.quest + "<br/>" : "") +
        (game.crew.building > 0 ? Utilities.Language.getText("ui.heading.crew.building") + ": " + game.crew.building + "<br/>" : "") +
        (game.crew.research > 0 ? Utilities.Language.getText("ui.heading.crew.research") + ": " + game.crew.research + "<br/>" : "") +
        "<br/>" +
        "</div>"
        ;

    $(detailsSelector).html(crewHTML);
}

function updateDiscoveries() {
    var available = Services.DiscoveryService.availableDefinitions(game);
    var availableHTML = "";
    if (game.discoverypoints > 0 || available.length > 0) {
        var discoveriesHTML = "";
        for (var i = 0; i < available.length; i++) {
            var definition = available[i];
            var discovery = game.discoveries.find(d => d.definition.id == definition.id);
            availableHTML += "<div class=\"discoveryAvailableCard " + (discovery != undefined && discovery.active ? "active " : "") + "card\">" +
                "<div data-discoverydefinitionid=\"" + definition.id + "\" class=\"questHeader\">" + definition.name + "</div>" +
                (discovery != undefined && discovery.iscomplete() ? "" :
                    (discovery != undefined ? "<div class=\"progress\"><div class=\"bar\" style=\"width: " + (discovery.pointsproduced / definition.pointsrequired) * 100 + "%\"></div>" : "")
                ) +
                "</div>" +
                (discovery == undefined || !discovery.active ? "<div class=\"\"><a href=\"#\" data-discoverydefinitionid=\"" + definition.id + "\" class=\"btn btn-xs setActiveDiscoveryButton\">" + Utilities.Language.getText("ui.activate") +"</a></div>" : "") +

                "</div>";

        }


        var pointsHTML = "<div>" +
            (game.discoverypoints > 0 ? Utilities.Language.getText("ui.heading.discoveries.points") +": " + game.discoverypoints + "<br/>" : "") +
            "</div>"
            ;

    }
    $(discoveriesAvailableListSelector).html(availableHTML);
    $(discoveriesPointsSelector).html(pointsHTML);


}

function updateUnlockedElements() {
    var unlocksHTML = "";
    var unlocks = [];
    game.buildings.concat(game.research).filter(e => e.iscomplete()) //.concat(game.research.filter(e => e.iscomplete())).concat(game.texts)
        .forEach(function (element) {
            if (element.definition.unlockelements) {
                unlocks.push(element.definition.unlockelements);
            }
        });
    game.texts //.concat(game.research.filter(e => e.iscomplete())).concat(game.texts)
        .forEach(function (element) {
            if (element.unlockelements) {
                unlocks.push(element.unlockelements);
            }
        });
    unlocksHTML = unlocks.join(", ");
    $(unlocksHTML).show();

}

function updateQuests() {
    var available = Services.QuestService.availableDefinitions(game);
    var availableHTML = ""
    for (var i = 0; i < available.length; i++) {
        var quest = available[i];
        availableHTML += "<div class=\"questAvailableCard card\">" +
            "<div data-questdefinitionid=\"" + quest.id + "\" class=\"questHeader\">" + quest.name + "</div>" +
            "<div class=\"\">" + Utilities.Language.getText("ui.time") +": " + formatTimeSpan(quest.timerequired) + "</div>" +
            "<div class=\"\"><a href=\"#\" data-questdefinitionid=\"" + quest.id + "\" class=\"btn btn-xs startQuestButton\">" + Utilities.Language.getText("ui.start") +"</a></div>" +

            "</div>";

    }
    $(questsAvailableListSelector).html(availableHTML)

    var questsHTML = "";
    for (var i = 0; i < game.quests.length; i++) {
        var quest = game.quests[i];
        questsHTML += "<div class=\"questCard card\">" +
            "<div data-questdefinitionid=\"" + quest.id + "\" class=\"questHeader\">" + quest.name + "</div>" +
            (quest.iscomplete() ? "" : "<div class=\"progress\"><div class=\"bar\" style=\"width: " + (quest.timeproduced / quest.definition.timerequired) * 100 + "%\"></div>") +

            "<div class=\"\"></div>" +

            "</div>";

    }

    $(questsListSelector).html(questsHTML);


}



function updateResearch() {
    var availableResearch = Services.ResearchService.availableResearchDefinitions(game);
    var researchAvailableHTML = ""
    for (var i = 0; i < availableResearch.length; i++) {
        var research = availableResearch[i];
        researchAvailableHTML += "<div class=\"researchAvailableCard card\">" +
            "<div data-researchdefinitionid=\"" + research.id + "\" class=\"researchHeader\">" + research.name + "</div>" +
            "<div class=\"\">" + Utilities.Language.getText("ui.time") +": " + formatTimeSpan(research.timerequired) + "</div>" +
            "<div class=\"\"><a href=\"#\" data-researchdefinitionid=\"" + research.id + "\" class=\"btn btn-xs startResearchButton\">" + Utilities.Language.getText("ui.start") +"</a></div>" +

            "</div>";

    }
    $(researchAvailableListSelector).html(researchAvailableHTML)

    var researchHTML = "";
    for (var i = 0; i < game.research.length; i++) {
        var research = game.research[i];
        researchHTML += "<div class=\"researchCard card\">" +
            "<div data-researchdefinitionid=\"" + research.id + "\" class=\"researchHeader\">" + research.name + "</div>" +
            (research.iscomplete() ? "" : "<div class=\"progress\"><div class=\"bar\" style=\"width: " + (research.timeproduced / research.definition.timerequired) * 100 + "%\"></div>") +

            "<div class=\"\"></div>" +

            "</div>";

    }

    $(researchListSelector).html(researchHTML);


}

function updateBuildings() {
    var available = Services.BuildingService.availableBuildingDefinitions(game);
    var availableHTML = ""
    for (var i = 0; i < available.length; i++) {
        var building = available[i];
        availableHTML += "<div class=\"buildingAvailableCard card\">" +
            "<div data-buildingdefinitionid=\"" + building.id + "\" class=\"buildingHeader\">" + building.name + "</div>" +
            "<div class=\"\">" + Utilities.Language.getText("ui.time") +": " + formatTimeSpan(building.timerequired) + "</div>" +
            "<div class=\"\"><a href=\"#\" data-buildingdefinitionid=\"" + building.id + "\" class=\"btn btn-xs startBuildingButton\">" + Utilities.Language.getText("ui.start") +"</a></div>" +

            "</div>";

    }
    $(buildingsAvailableListSelector).html(availableHTML)

    var buildingsHTML = "";
    for (var i = 0; i < game.buildings.length; i++) {
        var building = game.buildings[i];
        buildingsHTML += "<div class=\"buildingAvailableCard card\">" +
            "<div data-buildingdefinitionid=\"" + building.id + "\" class=\"buildingHeader\">" + building.name + "</div>" +
            (building.iscomplete() ? "" : "<div class=\"progress\"><div class=\"bar\" style=\"width: " + (building.timeproduced / building.definition.timerequired) * 100 + "%\"></div>") +


            "</div>";

    }

    $(buildingsListSelector).html(buildingsHTML);


}



// Region Utilities
function formatTimeSpan(time) {
    return time + "t";
}

function saveGame() {
    $(".saveIcon").show();
    window.localStorage.setItem("game", JSON.stringify(game));
    loadGame();
    $(".saveIcon").hide();
}

function loadGame() {
    var gameString = JSON.parse(window.localStorage.getItem("game"));
    if (gameString !== null) {
        game = gameString;
        for (var i = 0; i < game.research.length; i++) {
            var e = Entities.Research.toClass(game.research[i], Entities.Research.prototype);
            e.definition = Entities.ResearchDefinition.toClass(Services.ResearchService.allDefinitions().find(d => d.id == e.definition.id), Entities.ResearchDefinition.prototype);
            game.research[i] = e;
        }
        for (var i = 0; i < game.buildings.length; i++) {
            var e = Entities.Research.toClass(game.buildings[i], Entities.Building.prototype);
            e.definition = Entities.BuildingDefinition.toClass(Services.BuildingService.allDefinitions().find(d => d.id == e.definition.id), Entities.BuildingDefinition.prototype);
            game.buildings[i] = e;
        }
        for (var i = 0; i < game.quests.length; i++) {
            var e = Entities.Quest.toClass(game.quests[i], Entities.Quest.prototype);
            e.definition = Entities.QuestDefinition.toClass(Services.QuestService.allDefinitions().find(d => d.id == e.definition.id), Entities.QuestDefinition.prototype);
            game.quests[i] = e;
        }
        for (var i = 0; i < game.discoveries.length; i++) {
            var e = Entities.Discovery.toClass(game.discoveries[i], Entities.Discovery.prototype);
            e.definition = Entities.DiscoveryDefinition.toClass(Services.DiscoveryService.allDefinitions().find(d => d.id == e.definition.id), Entities.DiscoveryDefinition.prototype);
            game.discoveries[i] = e;
        }

        game.lastupdate = new Date(game.lastupdate);
    }
    else {
        game = getDefaultGame();
    }
    //    console.info(game);
}

function deleteGame() {
    window.localStorage.removeItem("game");
    loadGame();
    window.location.reload(true);
}

function getDefaultGame() {
    return {
        crew: { available: 25, sick: 0, quest: 0, build: 0, research: 0 },
        startGame: true,
        night: true,
        discoverypoints: 0,
        lastupdate: new Date(),
        startdate: new Date(),
        research: [],
        buildings: [],
        shipresearch: [],
        quests: [],
        texts: [],
        discoveries: [],
        notifications: []
    };
}

//endregion

