import {createDirectives} from "./creeps/directives/create_directives";
import {findNaturalCenter} from "./utilities/find_natural_room_center";
import {VirtualRoom} from "./virtuals/VirtualRoom";

export const loop = () => {
    for (const room of Object.values(Game.rooms)) {
        const virtual = new VirtualRoom(room);
        if (Game.time % 10 === 0) {
            createDirectives(virtual);
        }
        findNaturalCenter(virtual);
    }
};
