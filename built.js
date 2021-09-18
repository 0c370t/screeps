'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const createDirectives = (room) => {
    const controller = room.room.controller;
    if (controller) {
        // Fall back to putting energy in the controller
        const bestSource = room.findBestSource(controller.pos);
        if (bestSource) {
            const controllerDirective = {
                steps: [
                    {
                        type: "mine",
                        target: bestSource
                    },
                    {
                        type: "deposit",
                        target: controller.id
                    }
                ],
                roles: ["laborer"],
                availableCount: 4
            };
            room.addDirective(controllerDirective);
        }
    }
    console.log("Created Directives");
};

const colorGradient = [
    "#d22300",
    "#cd0402",
    "#d63400",
    "#da4200",
    "#de4f00",
    "#e15a00",
    "#e46600",
    "#e77100",
    "#e97b00",
    "#eb8600",
    "#ed9000",
    "#ef9a00",
    "#f0a400",
    "#f1ae00",
    "#f2b800",
    "#f3c200",
    "#f3cc00",
    "#f3d600",
    "#f3df16",
    "#f2e926",
];

const spiralFromPoint = (point, condition) => {
    let velocity = [0, -1];
    const delta = { x: 0, y: 0 };
    // console.log(condition({x: delta.x + point.x, y: delta.y + point.y}));
    while (!condition({ x: delta.x + point.x, y: delta.y + point.y })) {
        if (delta.x === delta.y
            || (delta.x < 0 && delta.x === -delta.y)
            || (delta.x > 0 && delta.x === 1 - delta.y)) {
            // change direction
            velocity = [-velocity[1], velocity[0]];
        }
        delta.x += velocity[0];
        delta.y += velocity[1];
    }
    return { x: delta.x + point.x, y: delta.y + point.y };
};

const { findNaturalCenter } = (() => ({
    findNaturalCenter: (room) => {
        let points = [];
        points.push(...room.room.find(FIND_SOURCES).map(s => s.pos));
        points.push(...room.room.find(FIND_MY_SPAWNS).map(s => s.pos));
        if (room.room.controller) {
            points.push(room.room.controller.pos);
        }
        points = points.sort((a, b) => {
            const x = a.x - b.x;
            if (x === 0)
                return a.y - b.y;
            return x;
        });
        room.room.visual.poly(points, {
            fill: colorGradient[0],
            opacity: 0.5,
        });
        let result = points.reduce((c, p) => ({ x: c.x + p.x, y: c.y + p.y }), { x: 0, y: 0 });
        result.x = Math.floor(result.x / points.length);
        result.y = Math.floor(result.y / points.length);
        result = spiralFromPoint(result, possibleResult => {
            const area = room.room.lookAtArea(possibleResult.y - 2, possibleResult.x - 2, possibleResult.y + 2, possibleResult.x + 2, true);
            return !area.some(p => p.type === "terrain" && p.terrain !== "plain");
        });
        return result;
    },
}))();

const laborer = {
    defaultBody: [WORK, CARRY, MOVE],
    extraPart: [WORK, CARRY, MOVE],
    maxPartLookup: {
        0: 0,
        1: 3,
        2: 6,
        3: 9,
        4: 12,
        5: 15,
        6: 18,
        7: 24,
        8: 30,
    },
    targetPopulation: 8,
};

const RoleHelper = {
    getBodyCost(body) {
        return body.reduce((p, c) => p + BODYPART_COST[c], 0);
    },
    buildBody(room, role) {
        const availableEnergy = room.availableEnergy;
        const body = role.defaultBody;
        while (this.getBodyCost(body) < availableEnergy && body < role.maxPartLookup[room.level]) {
            body.push(...role.extraPart);
        }
        return body;
    },
};

const roles = {
    laborer,
};

const census = (room) => {
    const existingCreeps = room.creepsByRole;
    for (const [roleName, role] of Object.entries(roles)) {
        if (existingCreeps[roleName] >= role.targetPopulation)
            continue;
        const body = RoleHelper.buildBody(room, role);
        const spawn = room.availableSpawn;
        if (spawn) {
            const memory = {
                role: roleName,
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

class VirtualCreep {
    constructor(creep) {
        this.creep = creep;
    }
    get roomMemory() { return this.creep.room.memory; }
    get memory() { return this.creep.memory; }
    get id() { return this.creep.id; }
    stepComplete() {
        this.creep.say("✅");
    }
    hasBodyPart(part) {
        return this.creep.getActiveBodyparts(part) > 0;
    }
    moveTo(target) {
        return this.creep.moveTo(target);
    }
}

class VirtualRoom {
    constructor(room) {
        this.room = room;
    }
    get sources() { return this.room.find(FIND_SOURCES); }
    get availableEnergy() { return this.room.energyAvailable; }
    get level() { var _a, _b; return (_b = (_a = this.room.controller) === null || _a === void 0 ? void 0 : _a.level) !== null && _b !== void 0 ? _b : 0; }
    get spawns() { return this.room.find(FIND_MY_SPAWNS); }
    get availableSpawn() {
        var _a;
        return (_a = this.spawns.find(s => !s.spawning)) !== null && _a !== void 0 ? _a : false;
    }
    get name() { return this.room.name; }
    get directives() {
        if (!this.room.memory.directives)
            this.room.memory.directives = {};
        return Object.values(this.room.memory.directives);
    }
    get directiveHashes() {
        if (!this.room.memory.directives)
            this.room.memory.directives = {};
        return Object.keys(this.room.memory.directives);
    }
    get creepsByRole() {
        const roomCreeps = this.room.find(FIND_MY_CREEPS);
        return roomCreeps.reduce((c, p) => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!c[p.memory.role]) {
                c[p.memory.role] = [];
            }
            c[p.memory.role].push(new VirtualCreep(p));
            return c;
            // @ts-expect-error the reduce function will add all needed keys to this record.
        }, {});
    }
    get naturalCenter() {
        if (this.room.memory.naturalCenter)
            return this.room.memory.naturalCenter;
        const result = findNaturalCenter(this);
        this.room.memory.naturalCenter = result;
        return result;
    }
    addDirective(d) {
        const serial = d.steps.map(c => `${c.type}->${c.target}`).join("|");
        if (!this.directiveHashes.includes(serial)) {
            this.room.memory.directives[serial] = d;
        }
    }
    findBestSource(pos) {
        var _a;
        const allSources = this.sources; // getter for Room.find(FIND_SOURCES)
        const scores = {};
        const taskedSources = (_a = this.room.memory.taskedSources) !== null && _a !== void 0 ? _a : {};
        for (const source of allSources) {
            let score = 0;
            if (source.id in taskedSources) {
                // Weight based on other creeps working on this source
                score -= taskedSources[source.id].length * 3;
            }
            // Weight based on proportion of available energy (0-10)
            score += Math.ceil((source.energy / source.energyCapacity) * 10);
            // Weight based on distance to target
            const pathLength = pos.findPathTo(source).length;
            // https://www.desmos.com/calculator/9fpwnvbeon
            const weight = Math.floor(20 / Math.pow(1.1, pathLength / 2));
            score += weight;
            scores[source.id] = score;
        }
        let bestSource, bestVal = Number.MIN_SAFE_INTEGER;
        for (const id in scores) {
            if (scores[id] > bestVal) {
                bestVal = scores[id];
                bestSource = id;
            }
        }
        return bestSource;
    }
    runCensus() {
        census(this);
    }
}

const loop = () => {
    for (const room of Object.values(Game.rooms)) {
        const virtual = new VirtualRoom(room);
        if (Game.time % 10 === 0) {
            createDirectives(virtual);
        }
        findNaturalCenter(virtual);
    }
};

exports.loop = loop;
