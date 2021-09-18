import {colorGradient} from "../constants";
import type {VirtualRoom} from "../virtuals/VirtualRoom";
import {spiralFromPoint} from "./spiral_from_point";

export const {findNaturalCenter} = (() => ({
    findNaturalCenter: (room: VirtualRoom) => {
        let points: RoomPosition[] = [];
        points.push(...room.room.find(FIND_SOURCES).map(s => s.pos));
        points.push(...room.room.find(FIND_MY_SPAWNS).map(s => s.pos));
        if (room.room.controller) {
            points.push(room.room.controller.pos);
        }

        points = points.sort((a, b) => {
            const x = a.x - b.x;
            if (x === 0) return a.y - b.y;
            return x;
        });
        
        
        room.room.visual.poly(points, {
            fill: colorGradient[0],
            opacity: 0.5,
        });

        let result = points.reduce((c, p) => ({x: c.x + p.x, y: c.y + p.y}), {x: 0, y: 0});
        result.x = Math.floor(result.x / points.length);
        result.y = Math.floor(result.y / points.length);
        
        result = spiralFromPoint(result, possibleResult => {
            const area = room.room.lookAtArea(possibleResult.y - 2, possibleResult.x - 2, possibleResult.y + 2, possibleResult.x + 2, true);
            
            return !area.some(p => p.type === "terrain" && p.terrain !== "plain");
        });

        return result;
    },
}))();
