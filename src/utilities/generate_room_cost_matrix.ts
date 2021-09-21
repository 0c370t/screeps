export const {generateCostMatrix} = (() => {
    let memo: Record<string, CostMatrix> = {};
    const tick = Game.time;

    const checkMemo = (roomName: string): CostMatrix | false => {
        if (Game.time > tick + 25) {
            memo = {};
            return false;
        }

        return memo[roomName] ?? false;

    };

    const terrainLookup = {
        "plain": 5,
        "swamp": 15,
    };

    return {
        generateCostMatrix: (roomName: string) => {
            const memoized = checkMemo(roomName);
            if (memoized) return memoized;
            
            const room = Game.rooms[roomName];
            if (!room) return undefined;
            const matrix = new PathFinder.CostMatrix();
            for (let x = 0; x < 50; x++) {
                for (let y = 0; y < 50; y++) {
                    const lookResults = room.lookAt(x, y);
                    let cost = 0,
                        exclude = false;
                    for (const result of lookResults) {
                        switch (result.type) {
                            case "terrain":
                                if (result.terrain === "wall") {
                                    exclude = true;
                                    continue;
                                }
                                cost += terrainLookup[result.terrain!];
                                continue;
                            case "structure":
                                if (result.structure?.structureType !== "road") {
                                    exclude = true;
                                    continue;
                                } else {
                                    cost -= 10;
                                    continue;
                                }
                            case "constructionSite":
                                if (result.constructionSite?.structureType === "road") {
                                    cost -= 10;
                                    continue;
                                }
                            default: continue;
                        }
                    }
                    if (!exclude) {
                        matrix.set(x, y, cost);
                    }
                }
            }
            memo[roomName] = matrix;
            return matrix;
        },
    };
})();
