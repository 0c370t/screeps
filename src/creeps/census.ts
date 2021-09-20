import type {VirtualRoom} from "../virtuals/VirtualRoom";
import type {RoleType} from "./roles";
import {RoleHelper, roles} from "./roles";

export const census = (room: VirtualRoom) => {
    console.log(`${room.name} | Running Census`);
    const existingCreeps = room.creepsByRole;
    for (const [roleName, role] of Object.entries(roles)) {
        console.log(`${room.name} | ${roleName}`);
        if (existingCreeps[roleName].length >= role.targetPopulation) continue;
        const body = RoleHelper.buildBody(room, role);
        console.log(`${room.name} | ${roleName} | ${JSON.stringify(body)}`);
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
