import { registerServices } from "./services/services.js"   

self.addEventListener("message", function (e) {
    var game = e.data[0];
    var updatesToRun = e.data[1];
    var services = e.data[2];
    var updateInterval = e.data[3];
    for (var t = 0; t < updatesToRun; t++) {

        for (var i = 0; i < services.length; i++) {
            var service = services[i];
            game = service.updateGame(game, updateInterval);
        }
        game.lastupdate.setSeconds(game.lastupdate.getSeconds() + updateInterval);
    }
    self.postMessage(game);
});