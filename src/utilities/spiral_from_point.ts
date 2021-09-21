type PointLike = RoomPosition | {x: number; y: number;};

export const spiralFromPoint = (point: PointLike, condition: (p: PointLike) => boolean): {x: number; y: number;} => {
    let velocity = [0, -1];
    const delta = {x: 0, y: 0};
    
    while (!condition({x: delta.x + point.x, y: delta.y + point.y})) {
        if (delta.x === delta.y
            || (delta.x < 0 && delta.x === -delta.y)
            || (delta.x > 0 && delta.x === 1 - delta.y)) {
        // change direction
            velocity = [-velocity[1], velocity[0]];
        }

        delta.x += velocity[0];
        delta.y += velocity[1];
    }

    return {x: delta.x + point.x, y: delta.y + point.y};
};
