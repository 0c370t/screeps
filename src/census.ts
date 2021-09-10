import {behaviors} from "./behaviors/index";

export const census = () => {
    console.log("Running census!");
    const creeps = Object.entries(Memory.creeps)
        .reduce<Record<keyof typeof behaviors, CreepMemory[]>>((out, [, creep]: [string, CreepMemory]) => {
        // Default all legacy creeps to harvesters
        if (!creep.role) creep.role = "harvester";

        if (!out[creep.role]) {
            out[creep.role] = [];
        }
        out[creep.role].push(creep);
        return out;
    }, {});

    // TODO: Make this more intelligent
    const spawner = Game.spawns.Spawn1;

    for (const role of Object.values(behaviors)) {
        if (!creeps[role.name] || creeps[role.name].length < role.targetPopulation) {
            // Attempt to Spawn Creep
            if (spawner.spawnCreep(role.body, `${role.name}${Game.time.toString()}`, {dryRun: true}) === OK) {
                spawner.spawnCreep(role.body, `${role.name}${Game.time.toString()}`, {
                    memory: {
                        role: role.name,
                    },
                });
                return;
            }
            // We won't be able to spawn any of this role, keep moving
            continue;
        }
    }
};
