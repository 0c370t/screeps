import {census} from "./census";
import {directiveGeneration} from "./directive_generation";
import {roomPlanning} from "./room_planning";

export function room_management() {
    for (const room of Object.values(Game.rooms)) {
        if (Game.time % 10 === 0) {
            census(room);
        }
        if (Game.time % 5 === 0) {
            directiveGeneration(room);
        }
        if (Game.time % 100 === 0) {
            roomPlanning(room);
        }
    }
}
