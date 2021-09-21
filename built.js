'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Priority;
(function (Priority) {
    Priority[Priority["CRITICAL"] = 10] = "CRITICAL";
    Priority[Priority["HIGH"] = 7] = "HIGH";
    Priority[Priority["NORMAL"] = 5] = "NORMAL";
    Priority[Priority["LOW"] = 3] = "LOW";
    Priority[Priority["NONE"] = 0] = "NONE";
})(Priority || (Priority = {}));
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

const containerPriorityLookup = {
    extension: Priority.HIGH,
};
const structurePriorityLookup = {
    constructedWall: Priority.LOW,
    extension: Priority.HIGH,
};
const createDirectives = (room) => {
    room.log(`Creating Directives`);
    const controller = room.room.controller;
    const containers = room.room.find(FIND_MY_STRUCTURES, {
        // @ts-expect-error Filter to only structures that have a store
        filter: s => s.store,
    });
    containers.forEach(c => {
        var _a;
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
                priority: (_a = containerPriorityLookup[c.structureType]) !== null && _a !== void 0 ? _a : Priority.NORMAL,
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
                priority: Priority.HIGH,
            };
            room.addDirective(spawnDirective);
        }
    });
    const sites = room.room.find(FIND_MY_CONSTRUCTION_SITES);
    sites.forEach(s => {
        var _a;
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
            priority: (_a = structurePriorityLookup[s.structureType]) !== null && _a !== void 0 ? _a : Priority.NORMAL,
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
                priority: controller.ticksToDowngrade > CONTROLLER_DOWNGRADE[controller.level] / 2 ? Priority.LOW : Priority.HIGH,
            };
            room.addDirective(controllerDirective);
        }
    }
};

const { generateCostMatrix } = (() => {
    let memo = {};
    const tick = Game.time;
    const checkMemo = (roomName) => {
        var _a;
        if (Game.time > tick + 25) {
            memo = {};
            return false;
        }
        return (_a = memo[roomName]) !== null && _a !== void 0 ? _a : false;
    };
    const terrainLookup = {
        "plain": 5,
        "swamp": 15,
    };
    return {
        generateCostMatrix: (roomName) => {
            var _a, _b;
            const memoized = checkMemo(roomName);
            if (memoized)
                return memoized;
            const room = Game.rooms[roomName];
            if (!room)
                return undefined;
            const matrix = new PathFinder.CostMatrix();
            for (let x = 0; x < 50; x++) {
                for (let y = 0; y < 50; y++) {
                    const lookResults = room.lookAt(x, y);
                    let cost = 0, exclude = false;
                    for (const result of lookResults) {
                        switch (result.type) {
                            case "terrain":
                                if (result.terrain === "wall") {
                                    exclude = true;
                                    continue;
                                }
                                cost += terrainLookup[result.terrain];
                                continue;
                            case "structure":
                                if (((_a = result.structure) === null || _a === void 0 ? void 0 : _a.structureType) !== "road") {
                                    exclude = true;
                                    continue;
                                }
                                else {
                                    cost -= 10;
                                    continue;
                                }
                            case "constructionSite":
                                if (((_b = result.constructionSite) === null || _b === void 0 ? void 0 : _b.structureType) === "road") {
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

const generateRoads = (room) => {
    if (room.level < 3)
        return;
    const controller = room.room.controller;
    const sources = room.room.find(FIND_SOURCES);
    const nodes = [];
    if (controller) {
        nodes.push(controller.pos);
    }
    sources.forEach(s => nodes.push(s.pos));
    const included_structures = [
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
            const { path } = PathFinder.search(n1, { pos: nodes[j], range: 1 }, { roomCallback: generateCostMatrix });
            // eslint-disable-next-line @typescript-eslint/no-loop-func
            path.forEach(p => {
                if (!p.look().some(v => v.constructionSite && v.constructionSite.structureType === "road")) {
                    p.createConstructionSite(STRUCTURE_ROAD);
                }
            });
        }
    });
};

const serializeDirective = (d) => d.steps.map(c => `${c.type}->${c.target}`).join("|");

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
        c.log(`Build target missing or of wrong type`);
        return StepStatus.ERROR;
    }
    const status = c.creep.build(target);
    switch (status) {
        case OK:
            return StepStatus.WORKING;
        case ERR_NO_BODYPART:
            c.log(`Missing required body part to complete task`);
            return StepStatus.ERROR;
        case ERR_NOT_IN_RANGE: {
            const movementStatus = c.moveTo(target.pos);
            if (movementStatus === ERR_NO_PATH) {
                c.log(`Unable to find a valid path!`);
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
        c.log(`Deposit target missing or of wrong type`);
        return StepStatus.ERROR;
    }
    if (target.store && !target.store.getFreeCapacity(RESOURCE_ENERGY)) {
        c.log(`Target is already full; completing task`);
        c.stepComplete();
        return StepStatus.DONE;
    }
    const status = c.creep.transfer(target, RESOURCE_ENERGY);
    switch (status) {
        case OK:
            return StepStatus.WORKING;
        case ERR_NO_BODYPART:
            c.log(`Missing required body part to complete task`);
            return StepStatus.ERROR;
        case ERR_NOT_IN_RANGE: {
            const movementStatus = c.moveTo(target.pos);
            if (movementStatus === ERR_NO_PATH) {
                c.log(`Unable to find a valid path!`);
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
        c.log(`Mining target missing or of wrong type`);
        return StepStatus.ERROR;
    }
    const status = c.creep.harvest(target);
    switch (status) {
        case OK:
            return StepStatus.WORKING;
        case ERR_NO_BODYPART:
            c.log(`Missing required body part to complete task`);
            return StepStatus.ERROR;
        case ERR_NOT_IN_RANGE: {
            const movementStatus = c.moveTo(target.pos, 1);
            if (movementStatus === ERR_NO_PATH) {
                c.log(`Unable to find a valid path!`);
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
            this._room = VirtualManager.getVirtualRoom(this.creep.room);
        return this._room;
    }
    get roomMemory() { return this.creep.room.memory; }
    get memory() { return this.creep.memory; }
    get name() { return this.creep.name; }
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
                    this.log(`Error encounteded while performing step ${JSON.stringify(step)}`);
                    this.memory.directive = undefined;
                    break;
            }
        }
        else {
            const available = room.directives;
            if (!available.length) {
                this.creep.say("No available work!");
                return;
            }
            const work = (_a = available.find(a => a.roles.includes(this.role))) !== null && _a !== void 0 ? _a : false;
            if (work !== false) {
                this.creep.memory.directive = {
                    steps: work.steps,
                    stepIndex: 0,
                };
                if (--work.availableCount <= 0) {
                    const hash = serializeDirective(work);
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                    (_b = this.room.room.memory.directives) === null || _b === void 0 ? true : delete _b[hash];
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
            range: range,
            visualizePathStyle: {
                opacity: 0.1,
                lineStyle: "dashed",
                strokeWidth: 0.1,
                stroke: "#cccccc",
            },
        });
    }
    log(...args) {
        console.log(`${this.room.name} -> ${this.name} | `, ...args);
    }
}

const laborer = {
    defaultBody: [WORK, CARRY, MOVE],
    extraPart: [MOVE, MOVE, CARRY, WORK],
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
        while (this.getBodyCost(body) < availableEnergy) {
            body.push(role.extraPart[i++ % role.extraPart.length]);
        }
        return body;
    },
};

const roles = {
    laborer,
};

const census = (room) => {
    var _a;
    room.log(`Running Census`);
    const existingCreeps = room.creepsByRole;
    for (const [roleName, role] of Object.entries(roles)) {
        if (((_a = existingCreeps[roleName]) === null || _a === void 0 ? void 0 : _a.length) >= role.targetPopulation)
            continue;
        const body = RoleHelper.buildBody(room, role);
        room.log(`${roleName} | ${JSON.stringify(body)}`);
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
                    room.log(`Census error! Unexpected not enough energy.`);
                    return;
                default:
                    return;
            }
        }
    }
};

const spiralFromPoint = (point, condition) => {
    let velocity = [0, -1];
    const delta = { x: 0, y: 0 };
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

class VirtualRoom {
    constructor(room) {
        this.room = room;
        this._sortedDirectives = [-1, []];
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
        if (this._sortedDirectives[0] !== Game.time) {
            const rawDirs = Object.values(this.room.memory.directives);
            this._sortedDirectives = [Game.time, rawDirs.sort((a, b) => b.priority - a.priority)];
            this.log(`Sorting directives`);
        }
        return this._sortedDirectives[1];
    }
    get creeps() {
        return this.room.find(FIND_MY_CREEPS).map(c => VirtualManager.getVirtualCreep(c));
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
            c[p.memory.role].push(VirtualManager.getVirtualCreep(p));
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
        const serial = serializeDirective(d);
        if (!this.directiveHashes.includes(serial)) {
            this.room.memory.directives[serial] = d;
        }
        else if (this.room.memory.directives[serial].priority !== d.priority) {
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
        if (this.room.memory.taskedSources[t].includes(c.id)) {
            this.room.memory.taskedSources[t] = this.room.memory.taskedSources[t].filter(ts => c.id !== ts);
        }
        // Do a sanity check
        const liveCreeps = c.room.creeps.map(_c => _c.id);
        this.room.memory.taskedSources[t] = this.room.memory.taskedSources[t].filter(ts => liveCreeps.includes(ts));
    }
    log(...args) {
        console.log(`${this.name} | `, ...args);
    }
}

const VirtualManager = (() => {
    let memo = {};
    let time = Game.time;
    const checkMemo = () => {
        if (time !== Game.time) {
            memo = {};
            time = Game.time;
        }
    };
    return {
        getVirtualCreep: (c) => {
            checkMemo();
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!memo[c.id])
                memo[c.id] = new VirtualCreep(c);
            return memo[c.id];
        },
        getVirtualRoom: (r) => {
            checkMemo();
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!memo[r.name])
                memo[r.name] = new VirtualRoom(r);
            return memo[r.name];
        },
    };
})();

const loop = () => {
    console.log(`<<< Tick ${Game.time} >>>`);
    for (const room of Object.values(Game.rooms)) {
        const virtual = VirtualManager.getVirtualRoom(room);
        virtual.creeps.forEach(c => { c.behave(virtual); });
        if (Game.time % 10 === 0) {
            createDirectives(virtual);
        }
        if ((Game.time + 5) % 10 === 0) {
            virtual.runCensus();
        }
        if (Game.time % 100 === 0) {
            generateRoads(virtual);
        }
        if (room.name === "sim") {
            // Simulator only behaviors
            // eslint-disable-next-line @typescript-eslint/no-loop-func
            virtual.directives.forEach(d => {
                const t = Game.getObjectById(d.steps[1].target);
                if (!t)
                    return;
                room.visual.text(d.priority.toString(), t.pos.x, t.pos.y + 0.25, {
                    align: "center",
                    font: 0.5,
                    color: colorGradient[d.priority],
                });
            });
        }
    }
    if (Game.time % 100 === 0) {
        const livingCreeps = Object.keys(Game.creeps);
        Object.keys(Memory.creeps).forEach(cn => {
            if (!livingCreeps.includes(cn)) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete Memory.creeps[cn];
            }
        });
    }
};

exports.loop = loop;
