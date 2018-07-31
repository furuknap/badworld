import { Language } from "../utilities/LanguageUtilities.js";

class UIElement {
    constructor(text) {
        this.text = text;
    }

}

export class Button extends UIElement {
    constructor(text) {
        super(text);
    }

}