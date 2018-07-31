export class Language  {
    constructor() {
        


    }
    static load() {
        var deferred = new $.Deferred();
        Language.language = getLang();
        if (Language.language.indexOf("-") > 0) {
            Language.language = Language.language.substring(0, 2);
        }
        $.get("./js/languages/" + Language.language + ".json", function (data) {
            Language.texts = data;
        }).done(function () {
            deferred.resolve();
        })
        .fail(function (a,b,c) {
            $.get("./js/languages/en.json", function (data) {
                Language.texts = data;
            }).done(function () {
                deferred.resolve();
            })
                .fail(function (a, b, c) {

                    deferred.reject(a, b, c);
                });
        });

        return deferred.promise();
    }
    static getText(textID) {
        var text = Language.texts[textID];
        if (text == undefined) {
            alert("Text " + textID + " for language " + this.language + " is not defined");
        }
        return text;
    }
    //updateGame(game, deltaTime) {
    //    console.warn("service does not implement updateGame");
    //    return game;
    //}
}


function getLang() {
    if (navigator.languages != undefined && navigator.languages.length > 0)
        return navigator.languages[0];
    else
        return navigator.language;
}
