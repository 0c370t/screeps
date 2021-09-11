import type {AvailableRoles} from "../roles/index";
import {roles} from "../roles/index";

const log = (s: string) => { console.log(`CENSUS | ${s}`) };

export const census = () => {
    log("Running census!");
    const creeps = Object.entries(Memory.creeps)
        .reduce<Record<AvailableRoles, CreepMemory[]>>((out, [, creep]: [string, CreepMemory]) => {
        out[creep.role].push(creep);
        return out;
    }, {"harvester": [], "builder": [] });

    // TODO: Make this more intelligent
    const spawner = Game.spawns.Spawn1;

    for (const role of Object.values(roles)) {
        if (creeps[role.name].length < role.targetPopulation) {
            // Attempt to Spawn Creep
            for (const body of role.bodies) {
                if (spawner.spawnCreep(body, `${role.name}${Game.time.toString()}`, {dryRun: true}) === OK) {
                    const memory = {
                        role: role.name,
                    };
                    spawner.spawnCreep(body, `${role.name}${Game.time.toString()}`, {
                        memory: {
                            ...memory,
                        },
                    });
                    console.log(`Spawned a ${role.name} with ${body}, and memory of ${JSON.stringify(memory)}`);

                    return;
                }
            }
            // We won't be able to spawn any of this role, keep moving
            continue;
        }
    }
};
