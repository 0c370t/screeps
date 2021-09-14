import type {AvailableRoles} from "../creeps/roles/index";
import {roles} from "../creeps/roles/index";

export const census = () => {
    const creeps = Object.entries(Memory.creeps)
        .reduce<Record<AvailableRoles, CreepMemory[]>>((out, [, creep]: [string, CreepMemory]) => {
        out[creep.role].push(creep);
        return out;
    }, {"harvester": [], "builder": [] });

    // TODO: Make this more intelligent
    const spawner = Game.spawns.Spawn1;

    for (const role of Object.values(roles)) {
        let targetBody: BodyPartConstant[] | undefined;
        if (creeps[role.name].length === 0) {
            targetBody = role.bodies[role.bodies.length - 1];
            if (spawner.spawnCreep(targetBody, `${role.name}${Game.time.toString()}`, {dryRun: true}) !== OK) continue;
        } else {
            const ratio = creeps[role.name].length / role.targetPopulation;
            // must be at least 1/2 pop to make largest body, 1/4 pop to make 2nd largest body, etc
            // eslint-disable-next-line @typescript-eslint/no-loop-func
            targetBody = role.bodies.find((v, i) => ratio > 1 / Math.pow(2, i));
            if (!targetBody || spawner.spawnCreep(targetBody, `${role.name}${Game.time.toString()}`, {dryRun: true}) !== OK) continue;
        }
        const memory = {
            role: role.name,
        };
        const status = spawner.spawnCreep(targetBody, `${role.name}${Game.time.toString()}`, {
            memory: {
                ...memory,
            },
        });
        if (status === OK) {
            console.log(`Spawned a ${role.name} with ${targetBody}, and memory of ${JSON.stringify(memory)}`);
            return;
        }
        console.log(`Failed to spawn! ${status}`);
        
    }
};
