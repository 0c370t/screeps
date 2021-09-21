import {colorGradient, smallColorGradient} from "./constants";
import {createDirectives} from "./creeps/directives/create_directives";
import {generateRoads} from "./utilities/generate_roads";
import {generateCostMatrix} from "./utilities/generate_room_cost_matrix";
import {VirtualManager} from "./virtuals/VirtualManager";

export const loop = () => {
    console.log(`<<< Tick ${Game.time} >>>`);
    for (const room of Object.values(Game.rooms)) {
        const virtual = VirtualManager.getVirtualRoom(room);

        virtual.creeps.forEach(c => { c.behave(virtual) });

        if (Game.time % 10 === 0) {
            createDirectives(virtual);
        }

        if ((Game.time + 5) % 10 === 0) {
            virtual.runCensus();
        }

        if (Game.time % 100 === 0) {
            generateRoads(virtual);
        }

        if (room.name === "sim") {
            // Simulator only behaviors
            // eslint-disable-next-line @typescript-eslint/no-loop-func
            virtual.directives.forEach(d => {
                const t: RoomObject | null = Game.getObjectById<RoomObject>(d.steps[1].target);
                if (!t) return;
                room.visual.text(d.priority.toString(), t.pos.x, t.pos.y + 0.25, {
                    align: "center",
                    font: 0.5,
                    color: colorGradient[d.priority],
                });
            });
        }
    }

    if (Game.time % 100 === 0) {
        const livingCreeps = Object.keys(Game.creeps);
        Object.keys(Memory.creeps).forEach(cn => {
            if (!livingCreeps.includes(cn)) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete Memory.creeps[cn];
            }
        });
    }
};
