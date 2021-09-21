import type {VirtualRoom} from "../virtuals/VirtualRoom";
import {generateCostMatrix} from "./generate_room_cost_matrix";

export const generateRoads = (room: VirtualRoom) => {
    if (room.level < 3) return;
    const controller = room.room.controller;
    const sources = room.room.find(FIND_SOURCES);
    const nodes: RoomPosition[] = [];
    if (controller) {
        nodes.push(controller.pos);
    }
    sources.forEach(s => nodes.push(s.pos));
    const included_structures: StructureConstant[] = [
        "container",
        "extension",
        "spawn",
    ];
    const structures = room.room.find(FIND_MY_STRUCTURES, {
        filter: s => included_structures.includes(s.structureType),
    });
    structures.forEach(s => nodes.push(s.pos));

    nodes.forEach((n1, i) => {
        for (let j = i; j < nodes.length; j++) {
            const {path} = PathFinder.search(n1, {pos: nodes[j], range: 1}, {roomCallback: generateCostMatrix});
            // eslint-disable-next-line @typescript-eslint/no-loop-func
            path.forEach(p => {
                if (!p.look().some(v => v.constructionSite && v.constructionSite.structureType === "road")) {
                    p.createConstructionSite(STRUCTURE_ROAD);
                }
            });
        }
    });
};
