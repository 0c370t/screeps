'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const createDirectives = (room) => {
    console.log(`${room.name} | Creating Directives`);
    const controller = room.room.controller;
    const containers = room.room.find(FIND_MY_STRUCTURES, {
        // @ts-expect-error Filter to only structures that have a store
        filter: s => s.store,
    });
    containers.forEach(c => {
        if (c.store.getFreeCapacity(RESOURCE_ENERGY)) {
            const bestSource = room.findBestSource(c.pos);
            if (!bestSource)
                return;
            const storeDirective = {
                steps: [
                    {
                        type: "mine",
                        target: bestSource,
                    },
                    {
                        type: "deposit",
                        target: c.id,
                    },
                ],
                roles: ["laborer"],
                availableCount: 2,
            };
            room.addDirective(storeDirective);
        }
    });
    const spawns = room.room.find(FIND_MY_SPAWNS);
    spawns.forEach(s => {
        if (s.store.getFreeCapacity(RESOURCE_ENERGY)) {
            const bestSource = room.findBestSource(s.pos);
            if (!bestSource)
                return;
            const spawnDirective = {
                steps: [
                    {
                        type: "mine",
                        target: bestSource,
                    },
                    {
                        type: "deposit",
                        target: s.id,
                    },
                ],
                roles: ["laborer"],
                availableCount: 4,
            };
            room.addDirective(spawnDirective);
        }
    });
    const sites = room.room.find(FIND_MY_CONSTRUCTION_SITES);
    sites.forEach(s => {
        const bestSource = room.findBestSource(s.pos);
        if (!bestSource)
            return;
        const siteDirective = {
            steps: [
                {
                    type: "mine",
                    target: bestSource,
                },
                {
                    type: "build",
                    target: s.id,
                },
            ],
            availableCount: 2,
            roles: ["laborer"],
        };
        room.addDirective(siteDirective);
    });
    if (controller) {
        // Fall back to putting energy in the controller
        const bestSource = room.findBestSource(controller.pos);
        if (bestSource) {
            const controllerDirective = {
                steps: [
                    {
                        type: "mine",
                        target: bestSource,
                    },
                    {
                        type: "deposit",
                        target: controller.id,
                    },
                ],
                roles: ["laborer"],
                availableCount: 4,
            };
            room.addDirective(controllerDirective);
        }
    }
};

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
        let i = 0;
        console.log(this.getBodyCost(body), availableEnergy, JSON.stringify(body), role.maxPartLookup[room.level]);
        while (this.getBodyCost(body) < availableEnergy && body.length < role.maxPartLookup[room.level]) {
            console.log("boop");
            body.push(role.extraPart[i++ % role.extraPart.length]);
        }
        return body;
    },
};

const roles = {
    laborer,
};

const census = (room) => {
    console.log(`${room.name} | Running Census`);
    const existingCreeps = room.creepsByRole;
    for (const [roleName, role] of Object.entries(roles)) {
        console.log(`${room.name} | ${roleName}`);
        if (existingCreeps[roleName].length >= role.targetPopulation)
            continue;
        const body = RoleHelper.buildBody(room, role);
        console.log(`${room.name} | ${roleName} | ${JSON.stringify(body)}`);
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

var StepStatus;
(function (StepStatus) {
    StepStatus["WORKING"] = "WORKING";
    StepStatus["DONE"] = "DONE";
    StepStatus["ERROR"] = "ERROR";
})(StepStatus || (StepStatus = {}));

const build = (c, step) => {
    if (c.creep.store.getUsedCapacity() === 0) {
        c.stepComplete();
        return StepStatus.DONE;
    }
    const target = Game.getObjectById(step.target);
    if (!target || target.progress === undefined) {
        console.log(`${c.creep.room.name} | Build target missing or of wrong type`);
        return StepStatus.ERROR;
    }
    const status = c.creep.build(target);
    switch (status) {
        case OK:
            return StepStatus.WORKING;
        case ERR_NO_BODYPART:
            console.log(`${c.creep.name} | Missing required body part to complete task`);
            return StepStatus.ERROR;
        case ERR_NOT_IN_RANGE: {
            const movementStatus = c.moveTo(target.pos);
            if (movementStatus === ERR_NO_PATH) {
                console.log(`${c.creep.name} | Unable to find a valid path!`);
                return StepStatus.ERROR;
            }
            return StepStatus.WORKING;
        }
        default:
            return StepStatus.WORKING;
    }
};

const deposit = (c, step) => {
    if (c.creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
        // Announce task completion
        c.stepComplete();
        return StepStatus.DONE;
    }
    const target = Game.getObjectById(step.target);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!target || (target.store === undefined && target.structureType !== "controller")) {
        console.log(`${c.creep.room.name} | Deposit target missing or of wrong type`);
        return StepStatus.ERROR;
    }
    const status = c.creep.transfer(target, RESOURCE_ENERGY);
    switch (status) {
        case OK:
            return StepStatus.WORKING;
        case ERR_NO_BODYPART:
            console.log(`${c.creep.name} | Missing required body part to complete task`);
            return StepStatus.ERROR;
        case ERR_NOT_IN_RANGE: {
            const movementStatus = c.moveTo(target.pos);
            if (movementStatus === ERR_NO_PATH) {
                console.log(`${c.creep.name} | Unable to find a valid path!`);
                return StepStatus.ERROR;
            }
            return StepStatus.WORKING;
        }
        case ERR_FULL:
            return StepStatus.DONE;
        default:
            return StepStatus.WORKING;
    }
};

const mine = (c, step) => {
    // Register the creep for work if it is not already
    if (!c.roomMemory.taskedSources)
        c.roomMemory.taskedSources = {};
    if (!c.roomMemory.taskedSources[step.target])
        c.roomMemory.taskedSources[step.target] = [];
    if (!c.roomMemory.taskedSources[step.target].includes(c.id))
        c.roomMemory.taskedSources[step.target];
    if (c.creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
        // Announce task completion
        c.stepComplete();
        if (c.roomMemory.taskedSources[step.target]) {
            // Indicate that we are done working on the source
            c.roomMemory.taskedSources[step.target] = c.roomMemory.taskedSources[step.target].filter(id => id !== c.creep.id);
        }
        return StepStatus.DONE;
    }
    const target = Game.getObjectById(step.target);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!target || target.energyCapacity === undefined) {
        console.log(`${c.creep.room.name} | Mining target missing or of wrong type`);
        return StepStatus.ERROR;
    }
    const status = c.creep.harvest(target);
    switch (status) {
        case OK:
            return StepStatus.WORKING;
        case ERR_NO_BODYPART:
            console.log(`${c.creep.name} | Missing required body part to complete task`);
            return StepStatus.ERROR;
        case ERR_NOT_IN_RANGE: {
            const movementStatus = c.moveTo(target.pos, 1);
            if (movementStatus === ERR_NO_PATH) {
                console.log(`${c.creep.name} | Unable to find a valid path!`);
                return StepStatus.ERROR;
            }
            return StepStatus.WORKING;
        }
        default:
            return StepStatus.WORKING;
    }
};

const steps = {
    deposit,
    mine,
    build,
};

class VirtualCreep {
    constructor(creep) {
        this.creep = creep;
    }
    get room() {
        if (!this._room)
            this._room = new VirtualRoom(this.creep.room);
        return this._room;
    }
    get roomMemory() { return this.creep.room.memory; }
    get memory() { return this.creep.memory; }
    get id() { return this.creep.id; }
    get role() { return this.creep.memory.role; }
    behave(room) {
        var _a, _b;
        if (this.memory.directive) {
            const step = this.memory.directive.steps[this.memory.directive.stepIndex];
            if (!step) {
                this.creep.memory.directive = undefined;
                return;
            }
            const status = steps[step.type](this, step);
            switch (status) {
                case StepStatus.DONE:
                    this.memory.directive.stepIndex++;
                    if (this.memory.directive.stepIndex > this.memory.directive.steps.length) {
                        this.memory.directive = undefined;
                    }
                    this.room.unflagWorkTarget(this, step.target);
                    if (this.memory.directive.steps[this.memory.directive.stepIndex]) {
                        this.room.flagWorkTarget(this, this.memory.directive.steps[this.memory.directive.stepIndex].target);
                    }
                    break;
                case StepStatus.ERROR:
                    console.log(`Error encounteded while performing step ${JSON.stringify(step)}`);
                    this.memory.directive = undefined;
                    break;
            }
        }
        else {
            const available = room.room.memory.directives;
            if (!available) {
                this.creep.say("No available work!");
                return;
            }
            const [hash, work] = (_a = Object.entries(available).find(([, a]) => a.roles.includes(this.role))) !== null && _a !== void 0 ? _a : [false, false];
            if (work !== false && hash !== false) {
                this.creep.memory.directive = {
                    steps: work.steps,
                    stepIndex: 0,
                };
                work.availableCount--;
                if (work.availableCount <= 0) {
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                    (_b = this.roomMemory.directives) === null || _b === void 0 ? true : delete _b[hash];
                }
                this.room.flagWorkTarget(this, work.steps[0].target);
            }
            else {
                this.creep.say("No available work!");
            }
        }
    }
    stepComplete() {
        this.creep.say("✅");
    }
    hasBodyPart(part) {
        return this.creep.getActiveBodyparts(part) > 0;
    }
    moveTo(target, range = 0) {
        return this.creep.moveTo(target, {
            range,
        });
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
    get creeps() {
        return this.room.find(FIND_MY_CREEPS).map(c => new VirtualCreep(c));
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
    flagWorkTarget(c, t) {
        if (this.room.memory.taskedSources === undefined)
            this.room.memory.taskedSources = {};
        if (this.room.memory.taskedSources[t] === undefined)
            this.room.memory.taskedSources[t] = [];
        if (!this.room.memory.taskedSources[t].includes(c.id))
            this.room.memory.taskedSources[t].push(c.id);
    }
    unflagWorkTarget(c, t) {
        if (this.room.memory.taskedSources === undefined)
            this.room.memory.taskedSources = {};
        if (this.room.memory.taskedSources[t] === undefined)
            this.room.memory.taskedSources[t] = [];
        if (!this.room.memory.taskedSources[t].includes(c.id)) {
            console.log("Unflagging", this.room.memory.taskedSources[t].length);
            this.room.memory.taskedSources[t] = this.room.memory.taskedSources[t].filter(_t => c.id !== _t);
            console.log("Unflagged", this.room.memory.taskedSources[t].length);
        }
    }
}

const loop = () => {
    for (const room of Object.values(Game.rooms)) {
        const virtual = new VirtualRoom(room);
        virtual.creeps.forEach(c => { c.behave(virtual); });
        if (Game.time % 10 === 0) {
            createDirectives(virtual);
        }
        if ((Game.time + 5) % 10 === 0) {
            virtual.runCensus();
        }
        // findNaturalCenter(virtual);
    }
    if (Game.time % 100 === 0) {
        const livingCreeps = Object.keys(Game.creeps);
        Object.keys(Memory.creeps).forEach(cn => {
            if (!livingCreeps.includes(cn)) {
                delete Memory.creeps[cn];
            }
        });
    }
};

exports.loop = loop;
