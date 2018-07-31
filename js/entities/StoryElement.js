import { Entity } from "./Entity.js"
import * as Utilities from "../utilities/utilities.js"

export class StoryElement extends Entity {
    constructor(name, id, textid, language) {
        super();
        if (id !== undefined) {
            this.id = id;
        }
        this.name = name;
        this.textid = textid;
//        this.text = Utilities.Language.getText(textid);
    }
}

