import {census} from "./census";

export function* room_management() {
    while (true) {
        for (const room of Object.values(Game.rooms)) {
            if (Game.time % 10 === 0) {
                census(room);
            }
        }
        yield {};
    }
}
