import type {VirtualRoom} from "../../virtuals/VirtualRoom";
import type {Role} from "./types";

export const RoleHelper = {
    getBodyCost(body: BodyPartConstant[]) {
        return body.reduce((p, c) => p + BODYPART_COST[c], 0);
    },

    buildBody(room: VirtualRoom, role: Role): BodyPartConstant[] {
        const availableEnergy = room.availableEnergy;
        const body = role.defaultBody;
        while (this.getBodyCost(body) < availableEnergy && body < role.maxPartLookup[room.level]) {
            body.push(...role.extraPart);
        }
        return body;
    },
};
