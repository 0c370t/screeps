import {VirtualCreep} from "./VirtualCreep";
import {VirtualRoom} from "./VirtualRoom";

export const VirtualManager = (() => {
    let memo: Record<Id<Creep> | string, VirtualCreep | VirtualRoom> = {};
    let time = Game.time;

    const checkMemo = () => {
        if (time !== Game.time) {
            memo = {};
            time = Game.time;
        }
    };

    return {
        getVirtualCreep: (c: Creep): VirtualCreep => {
            checkMemo();
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!memo[c.id]) memo[c.id] = new VirtualCreep(c);
            return memo[c.id] as VirtualCreep;
        },
        getVirtualRoom: (r: Room): VirtualRoom => {
            checkMemo();
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!memo[r.name]) memo[r.name] = new VirtualRoom(r);
            return memo[r.name] as VirtualRoom;
        },
    };
})();
