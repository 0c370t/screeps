import {census} from "./census";
import {directiveGeneration} from "./directive_generation";

export function* room_management() {
    while (true) {
        for (const room of Object.values(Game.rooms)) {
            if (Game.time % 10 === 0) {
                census(room);
            }
            if (Game.time % 5 === 0) {
                directiveGeneration(room);
            }
        }
        yield {};
    }
}
