var game = {}
var updateInterval = 1;
var saveInterval = 5;
var services = [];
var isRunningUpdates = false;
var pauseUpdates = false;
var runViewUpdates = true;
var autoScroll = true;
var bwversion = 0.9;
//region Selector
var researchAvailableListSelector = ".researchAvailableList";
var researchListSelector = ".researchList";
var researchListMoreSelector = ".researchListMore";
var buildingsAvailableListSelector = ".buildingsAvailableList";
var buildingsListSelector = ".buildingsList";
var buildingsListMoreSelector = ".buildingsListMore";
var questsAvailableListSelector = ".questsAvailableList";
var questsListSelector = ".questsList";

var discoveriesAvailableListSelector = ".discoveriesAvailableList";
var discoveriesPointsSelector = ".discoveriesList";

var detailsSelector = ".details";
var inventorySelector = ".inventoryControls";

import * as Services from "./services/services.js"
import * as Entities from "./entities/entities.js"
import * as Utilities from "./utilities/utilities.js"
import * as UI from "./ui/uielements.js"
import { Language } from "./utilities/utilities.js";




$(document).ready(function () {
    Utilities.Language.load().done(function () {
        if (getUrlVars()["langfile"]) {
            var langFile = Utilities.Language.getTextFile(getUrlVars["langfile"]);
            $("body").removeClass("night").html("").html(JSON.stringify(langFile));
        }
        else {

            translateUI();
            setInterval(saveGame, saveInterval * 1000);
            setInterval(updateGame, updateInterval * 1000);

            loadGame();
            setupButtons();

            refreshView();
            registerServices();

        }
    })


});

function registerServices() {

    services.push(new Services.BuildingService());
    services.push(new Services.ResearchService());
    services.push(new Services.StoryService());
    services.push(new Services.QuestService());
    services.push(new Services.DiscoveryService());
    services.push(new Services.EventService());
    services.push(new Services.CrewService());
}
function setupButtons() {
    $(document).on("click", ".btnWakeUp", function () {
        game.night = false;
        game.startGame = false;
        refreshView();
    });

    $(document).on("click", ".exportSave", function () {
        $("#exportDialog").modal('show');
    })
    $(document).on("click", ".importSave", function () {
        $("#importDialog").modal('show');
    })
    $(document).on("click", ".importButton", function () {
        var gameString = $("#importGame").val();
        loadGame(gameString);
    })
    //importButton

    $(document).on("click", ".resetGame", function () {
        if (confirm("Are you sure you want to reset the game?")) {
            deleteGame();
        }
    })

    $(document).on("click", ".addGuard", function () {
        Services.CrewService.changeGuards(game, 1);
    })
    $(document).on("click", ".removeGuard", function () {
        Services.CrewService.changeGuards(game, -1);
    })


    $(document).on("click", ".storyToggle", function () {
        $("#storyDialog").modal('show'); 
    })

    $(document).on("click", ".toggleUpdates", function () {
        runViewUpdates = !runViewUpdates;
    })
    $(document).on("click", ".toggleScroll", function () {
        autoScroll = !autoScroll;
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
    $(document).on("mouseover", ".notificationsshow", function (sender) {
        $(".notificationshidden").show()
    });
    $(document).on("mouseout", ".notificationsshow", function (sender) {
        $(".notificationshidden").hide()
    });

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

        $("#exportGame").val(JSON.stringify(game));
        updateScroll();

        updateResearch();
        updateBuildings();
        updateQuests();
        updateDiscoveries();

        updateDetails();
        updateInventory();
        showNotifications();
    }

}

function showNotifications() {
    if (game.notifications.length > 0) {
        var notificationsMax = game.notifications.length > 10 ? 10 : game.notifications.length;
        var notificationsToList = game.notifications.slice(game.notifications.length - notificationsMax, notificationsMax);
        var firstclass = "notificationsshow";
        var dif = new Date().getTime() - new Date(game.notifications[notificationsMax - 1].date).getTime();
        if (dif < 2000) {
            firstclass += " recent";
        }
        var html = "<span class=\""+firstclass+"\">" + Language.getText(game.notifications[notificationsMax-1].textid).substring(0,50) + "...</span>";

        $(".notifications").html(html);
        var hiddenhtml = "";
        for (var i = notificationsToList.length-1; i >=0 ; i--) {
            var notification = game.notifications[i];
            hiddenhtml += "<div class=\"notificationsentry\">" + Language.getText(notification.textid)+"</div>";
        }
        $(".notificationshidden").html(hiddenhtml);
        game.notifications = notificationsToList;
    }
}


function updateDetails() {
    $(detailsSelector).html();
    var crewHTML = "<div>" +
        "<strong>" + Utilities.Language.getText("ui.heading.crew") + "</strong><br/>" +
        Utilities.Language.getText("ui.heading.crew.available") + ": " + Services.CrewService.getAvailable(game) + "<br/>" +
        (game.crew.sick > 0 ? Utilities.Language.getText("ui.heading.crew.wounded") + ": " + game.crew.sick + "<br/>" : "") +
        (Services.QuestService.getCrewAllocated(game) > 0 ? Utilities.Language.getText("ui.heading.crew.quests") + ": " + Services.QuestService.getCrewAllocated(game) + "<br/>" : "") +
        (game.crew.building > 0 ? Utilities.Language.getText("ui.heading.crew.building") + ": " + game.crew.building + "<br/>" : "") +
        (game.crew.research > 0 ? Utilities.Language.getText("ui.heading.crew.research") + ": " + game.crew.research + "<br/>" : "") +
        (game.buildings.some(b => b.definition.id == "guardpost" && b.iscomplete()) ? Utilities.Language.getText("ui.heading.crew.guards") + ": " + game.crew.guards + " <a href=\"#\" class=\"addGuard btn btn-xs\">+</a> <a href=\"#\" class=\"removeGuard btn btn-xs\">-</a><br/>" : "") +
        "<br/>" +
        "</div>"
        ;

    $(detailsSelector).html(crewHTML);
}

function updateInventory() {
    $(inventorySelector).html();
    var inventoryHTML = "<div>" +
        "<strong>" + Utilities.Language.getText("ui.heading.inventory") + "</strong><br/>" +
        Utilities.Language.getText("ui.heading.inventory.medkits") + ": " + game.inventory.medkits + "<br/>" +
        (game.discoveries.some(d=>d.definition.id=="medicinalplants" && d.iscomplete()) ?  Utilities.Language.getText("ui.heading.inventory.medicinalplants") + ": " + game.inventory.medicinalplants + "<br/>" :"") +
        (game.discoveries.some(d=>d.definition.id=="powercrystals" && d.iscomplete()) ?  Utilities.Language.getText("ui.heading.inventory.powercrystals") + ": " + game.inventory.powercrystals + "<br/>" :"") +
        (game.research.some(r => r.definition.id == "alienshipdatadevice" && r.iscomplete()) ? Utilities.Language.getText("ui.heading.inventory.datadevices") + ": " + game.inventory.datadevices + "<br/>" :"") +
        "<br/>" +
        "</div>"
        ;

    $(inventorySelector).html(inventoryHTML);
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
                (discovery == undefined || !discovery.active ? "<div class=\"\"><a href=\"#\" data-discoverydefinitionid=\"" + definition.id + "\" class=\"btn btn-xs setActiveDiscoveryButton\">" + Utilities.Language.getText("ui.activate") + "</a></div>" : "") +

                "</div>";

        }


        var pointsHTML = "<div class=\"discoveryPoints\">" +
            (game.discoverypoints > 0 ? Utilities.Language.getText("ui.heading.discoveries.points") + ": " + game.discoverypoints + "<br/>" : "") +
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
    $(unlocksHTML).removeClass("unlockable").show();
    if (game.state.part1complete) {
        $(".part1").hide();
    }
}

function updateQuests() {
    var available = Services.QuestService.availableDefinitions(game);
    var availableHTML = ""
    for (var i = 0; i < available.length; i++) {
        var quest = available[i];
        availableHTML += "<div class=\"questAvailableCard card\">" +
            "<div data-questdefinitionid=\"" + quest.id + "\" class=\"questHeader\">" + quest.name + "</div>" +
            "<div class=\"\">" + Utilities.Language.getText("ui.time") + ": " + formatTimeSpan(quest.timerequired) + "</div>" +
            "<div class=\"\"><a href=\"#\" data-questdefinitionid=\"" + quest.id + "\" class=\"btn btn-xs startQuestButton\">" + Utilities.Language.getText("ui.start") + "</a></div>" +

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
            "<div class=\"\">" + Utilities.Language.getText("ui.time") + ": " + formatTimeSpan(research.timerequired) + "</div>" +
            "<div class=\"\"><a href=\"#\" data-researchdefinitionid=\"" + research.id + "\" class=\"btn btn-xs startResearchButton\">" + Utilities.Language.getText("ui.start") + "</a></div>" +

            "</div>";

    }
    $(researchAvailableListSelector).html(researchAvailableHTML)

    var researchHTML = "";
    var listCount = 0;
    var list = "";
    for (var i = game.research.length-1; i >=0 ; i--) {
        var research = game.research[i];
        if (listCount < 4) {
            var html = "<div class=\"researchCard card\">" +
                "<div data-researchdefinitionid=\"" + research.id + "\" class=\"researchHeader\">" + research.name + "</div>" +
                (research.iscomplete() ? "" : "<div class=\"progress\"><div class=\"bar\" style=\"width: " + (research.timeproduced / research.definition.timerequired) * 100 + "%\"></div>") +

                "<div class=\"\"></div>" +

                "</div>";
            html = research.definition.postrender(game, html, research);
            listCount++;
            researchHTML += html;
        }
        else {
            list += research.name + "\n";
            $(researchListMoreSelector).show();
        }


    }

    $(researchListSelector).html(researchHTML);
    $(researchListMoreSelector).attr("title", list);


}

function updateBuildings() {
    var available = Services.BuildingService.availableDefinitions(game);
    var availableHTML = "";
    var listCount = 0;
    var list = "";

    for (var i = 0; i < available.length; i++) {
        var building = available[i];
        availableHTML += "<div class=\"buildingAvailableCard card\">" +
            "<div data-buildingdefinitionid=\"" + building.id + "\" class=\"buildingHeader\">" + building.name + "</div>" +
            "<div class=\"\">" + Utilities.Language.getText("ui.time") + ": " + formatTimeSpan(building.timerequired) + "</div>" +
            "<div class=\"\"><a href=\"#\" data-buildingdefinitionid=\"" + building.id + "\" class=\"btn btn-xs startBuildingButton\">" + Utilities.Language.getText("ui.start") + "</a></div>" +

            "</div>";

    }
    $(buildingsAvailableListSelector).html(availableHTML)

    var buildingsHTML = "";
    for (var i = game.buildings.length - 1; i >= 0; i--) {
        var building = game.buildings[i];
        if (listCount < 4 || building.damage > 0) {
            var completePercentage = (((building.timeproduced / building.definition.timerequired) * 100));
            completePercentage -= building.damage ? building.damage : 0;
            var html = "<div class=\"buildingAvailableCard card\">" +
                "<div data-buildingdefinitionid=\"" + building.id + "\" class=\"buildingHeader\">" + building.name + (building.damage > 0 ? " [" + (100 - parseInt(building.damage)) + "%]" : "") + "</div>" +
                (building.iscomplete() ? "" : "<div class=\"progress\"><div class=\"bar\" style=\"width: " + completePercentage + "%\"></div>") +


                "</div>";

            html = building.definition.postrender(game, html, building);
            listCount++;
            buildingsHTML += html;
        }
        else {
            list += building.name + "\n";
            $(buildingsListMoreSelector).show();
        }

    }

    $(buildingsListSelector).html(buildingsHTML);
    $(buildingsListMoreSelector).attr("title", list);

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

function loadGame(gameString) {
    if (gameString == undefined) {
        gameString = window.localStorage.getItem("game");
    }

    if (gameString !== null) {
        game = JSON.parse(gameString);

        if (game.meta == undefined || game.meta.version < bwversion) {
            game = getDefaultGame();
        }
        else {
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
            for (var i = 0; i < game.notifications.length; i++) {
                var e = Entities.Notification.toClass(game.notifications[i], Entities.Notification.prototype);
                game.notifications[i] = e;
            }
            for (var i = 0; i < game.events.length; i++) {
                var e = {};
                if (e.type == "attack") {
                    e = Entities.Event.toClass(game.events[i], Entities.Discovery.prototype);
                    e.definition = Entities.AttackEventDefinition.toClass(Services.EventService.allDefinitions().find(d => d.id == e.definition.id), Entities.AttackEventDefinition.prototype);
                }
                game.events[i] = e;
            }

            game.lastupdate = new Date(game.lastupdate);
        }

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
        meta: { version: bwversion, language: "en"},
        attacks: { count: 0, wounded: 0 },
        crew: {
            available: 25,
            sick: 0,
            quest: 0,
            building: 0,
            research: 0,
            guards: 0
        },
        inventory: { medkits: 0, medicinalplants: 0, powercrystals: 0, datadevices: 0, cargodrones: 0 },
        state: { krucaptive: false },
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
        events: [],
        discoveries: [],
        notifications: []
    };
}
function updateScroll() {
    if (autoScroll) {
        var element = document.getElementById("messages");
        element.scrollTop = element.scrollHeight;
    }
}
//endregion

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}