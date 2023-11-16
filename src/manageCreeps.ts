import { creeps } from "./globals";

export const manageCreeps = () => {
    if (Game.time % 100 === 0) {
    // Cleanup Memory
        for (const name in Memory.creeps) {
            if (!(name in Game.creeps)) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete Memory.creeps[name];
            }
        }
    }

    for (const name in Game.creeps) {
        const creep = Game.creeps[name];
        if (!creep.my) {
            continue;
        }
        const room = creep.memory.room || creep.room.name;
        creeps[room] = creeps[room] || [];
        creeps[room].push(creep);
    }
};
