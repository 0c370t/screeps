import type {VirtualRoom} from "../virtuals/VirtualRoom";
import type {RoleType} from "./roles";
import {RoleHelper, roles} from "./roles";

export const census = (room: VirtualRoom) => {
    const existingCreeps = room.creepsByRole;
    for (const [roleName, role] of Object.entries(roles)) {
        if (existingCreeps[roleName] >= role.targetPopulation) continue;
        const body = RoleHelper.buildBody(room, role);
        const spawn = room.availableSpawn;
        if (spawn) {
            const memory = {
                role: roleName as RoleType,
            };
            const status = spawn.spawnCreep(body, `${roleName}-${Game.time}`, {
                memory: memory,
            });
            switch (status) {
                case ERR_NOT_ENOUGH_ENERGY:
                    console.log(`${room.name} | Census error! Unexpected not enough energy.`);
                    return;
                default:
                    return;
            }
        }
    }
};
