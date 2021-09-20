import type {VirtualRoom} from "../../virtuals/VirtualRoom";
import type {Role} from "./types";

export const RoleHelper = {
    getBodyCost(body: BodyPartConstant[]) {
        return body.reduce((p, c) => p + BODYPART_COST[c], 0);
    },

    buildBody(room: VirtualRoom, role: Role): BodyPartConstant[] {
        const availableEnergy = room.availableEnergy;
        const body = role.defaultBody;
        let i = 0;
        console.log(this.getBodyCost(body), availableEnergy, JSON.stringify(body), role.maxPartLookup[room.level]);
        while (this.getBodyCost(body) < availableEnergy && body.length < role.maxPartLookup[room.level]) {
            console.log("boop");
            body.push(role.extraPart[i++ % role.extraPart.length]);
        }
        return body;
    },
};
