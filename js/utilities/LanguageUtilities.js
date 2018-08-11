export class Language {
    constructor() {



    }
    static load() {
        var deferred = new $.Deferred();
        Language.language = getLang();

        $.get("./js/languages/en.json", function (data) {
            Language.entexts = data;
        }).done(function () {
        })
            .fail(function (a, b, c) {

                console.warn("Unable to load default language!");
            });


        if (Language.language.indexOf("-") > 0) {
            Language.language = Language.language.substring(0, 2);
        }
        $.get("./js/languages/" + Language.language + ".json", function (data) {
            Language.texts = data;
        }).done(function () {
            deferred.resolve();
        })
            .fail(function (a, b, c) {
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
            console.warn("Text " + textID + " for language " + this.language + " is not defined");
            text = "<span class=\"needtrans\" title=\"[NEED_TRANS(" + textID + "/" + Language.language + ")]\">*</span> " + Language.entexts[textID];
        }
        return text;
    }
    static getTextFile() {
        for (var textid in Language.entexts) {
            if (Language.texts[textid] == undefined) {
                Language.texts[textid] = "";
            }
        }
        return Language.texts;
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
