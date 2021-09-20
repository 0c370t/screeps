import {createDirectives} from "./creeps/directives/create_directives";
import {findNaturalCenter} from "./utilities/find_natural_room_center";
import {VirtualRoom} from "./virtuals/VirtualRoom";

export const loop = () => {
    for (const room of Object.values(Game.rooms)) {
        const virtual = new VirtualRoom(room);

        virtual.creeps.forEach(c => { c.behave(virtual) });

        if (Game.time % 10 === 0) {
            createDirectives(virtual);
        }

        if ((Game.time + 5) % 10 === 0) {
            virtual.runCensus();
        }

        // findNaturalCenter(virtual);
    }

    if (Game.time % 100 === 0) {
        const livingCreeps = Object.keys(Game.creeps);
        Object.keys(Memory.creeps).forEach(cn => {
            if (!livingCreeps.includes(cn)) {
                delete Memory.creeps[cn];
            }
        });
    }
};
