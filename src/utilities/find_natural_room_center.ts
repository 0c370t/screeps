import { VirtualRoom } from "../virtuals/VirtualRoom";
import { colorGradient } from "../constants";

export const { findNaturalCenter } = (() => {
    return {
        findNaturalCenter(room: VirtualRoom) {
            let points: RoomPosition[] = [];
            points.push(...room.room.find(FIND_SOURCES).map(s => s.pos));
            points.push(...room.room.find(FIND_MY_SPAWNS).map(s => s.pos));
            if (room.room.controller) {
                points.push(room.room.controller.pos)
            }

            points = points.sort((a, b) => {
                const y = a.y - b.y;
                if (y === 0) return a.x - b.x;
                return y;
            });
            let results: { x: number, y: number }[] = [...points];
            let i = 0;
            let colors = "";
            room.room.visual.poly(points, {
                fill: "#aa5500",
                opacity: 0.5
            });

            while (results.length > 1 && i < colorGradient.length) {
                i++;
                let midpoints: { x: number, y: number }[] = [];
                for (let i = 0; i < results.length; i++) {
                    const a = results[i];
                    const b = results[(i + 1) % results.length];
                    console.log(JSON.stringify([a, b]))
                    midpoints.push(
                        {
                            x: (a.x + b.x) / 2,
                            y: (a.y + b.y) / 2
                        }
                    )
                }
                midpoints.forEach(p => room.room.visual.circle(p.x, p.y, {
                    radius: 0.1,
                    fill: colorGradient[i % colorGradient.length],
                    opacity: 0.5
                }))
                results = midpoints;
            }
            const result = results[0];
            room.room.visual.circle(result.x, result.y, {
                radius: 0.5,
                fill: "#00ff00",
                opacity: 1
            })
        }
    }
})()