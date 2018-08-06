import { Entity } from "./Entity.js"
import { Language } from "../utilities/LanguageUtilities.js";

export class Notification extends Entity {
    constructor(textid, date, duration, plaintext) {
        super();
        this.textid = textid;
        if (date==undefined)
            this.date = new Date();
        this.buttons = [ new Button(Language.getText("ui.ok")) ];
        this.duration = 30;
        if (duration > 0) {
            this.duration = duration;
        }
    };
}

export class Button {
    constructor(text) {
        this.text = text;
        this.click = function () { return true; };
    }

}