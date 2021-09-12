'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var WorkStatus;
(function (WorkStatus) {
    WorkStatus[WorkStatus["DONE"] = 1] = "DONE";
    WorkStatus[WorkStatus["WORKING"] = 0] = "WORKING";
})(WorkStatus || (WorkStatus = {}));

function getTarget$1(creep) {
    if (creep.memory.targetConSite) {
        var targetSite_1 = Game.getObjectById(creep.memory.targetConSite);
        if (targetSite_1)
            return targetSite_1;
        creep.memory.targetConSite = undefined;
    }
    // Find construction site;
    var targetSite = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
    if (!targetSite) {
        // No sites found
        return false;
    }
    creep.memory.targetConSite = targetSite.id;
    return targetSite;
}
var build = function (creep) {
    if (creep.memory.task === undefined)
        creep.memory.task = "build";
    var target = getTarget$1(creep);
    if (!target)
        return WorkStatus.DONE;
    var status = creep.build(target);
    switch (status) {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(target);
            return WorkStatus.WORKING;
        case OK:
            return WorkStatus.WORKING;
        case ERR_NOT_ENOUGH_RESOURCES:
            return WorkStatus.DONE;
        default:
            console.log("Unknown Error Encountered!");
            creep.memory.targetConSite = undefined;
            return WorkStatus.DONE;
    }
};

function deposit(creep) {
    if (!creep.memory.task)
        creep.memory.task = "deposit";
    if (!creep.memory.destination) {
        creep.memory.task = undefined;
        return WorkStatus.DONE;
    }
    var destintation = Game.getObjectById(creep.memory.destination);
    if (!destintation) {
        creep.memory.task = undefined;
        creep.memory.destination = undefined;
        return WorkStatus.DONE;
    }
    switch (creep.transfer(destintation, RESOURCE_ENERGY)) {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(destintation);
            return WorkStatus.WORKING;
        case ERR_FULL:
        case ERR_NOT_ENOUGH_ENERGY:
        case ERR_NOT_ENOUGH_RESOURCES:
            return WorkStatus.DONE;
        default: return WorkStatus.WORKING;
    }
}

function maintain(creep) {
    if (!creep.memory.task)
        creep.memory.task = "maintain";
    if (!creep.memory.destination) {
        creep.memory.task = undefined;
        return WorkStatus.DONE;
    }
    var destintation = Game.getObjectById(creep.memory.destination);
    if (!destintation) {
        creep.memory.task = undefined;
        creep.memory.destination = undefined;
        return WorkStatus.DONE;
    }
    switch (creep.repair(destintation)) {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(destintation);
            return WorkStatus.WORKING;
        case ERR_NOT_ENOUGH_ENERGY:
        case ERR_NOT_ENOUGH_RESOURCES:
            return WorkStatus.DONE;
        default: return WorkStatus.WORKING;
    }
}

function getTarget(creep) {
    var roomMem = creep.room.memory;
    // Do not trust memory
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!roomMem.sourceAttentions)
        roomMem.sourceAttentions = {};
    var target;
    if (creep.memory.targetSource) {
        var found = Game.getObjectById(creep.memory.targetSource);
        if (found) {
            target = found;
        }
    }
    if (!target) {
        var sources = creep.room.find(FIND_SOURCES);
        var min_1 = Number.MAX_SAFE_INTEGER;
        // default to first source
        var found_1 = sources[0];
        sources.forEach(function (s) {
            if (!roomMem.sourceAttentions[s.id]) {
                roomMem.sourceAttentions[s.id] = 0;
            }
            if (roomMem.sourceAttentions[s.id] < min_1) {
                found_1 = s;
                min_1 = roomMem.sourceAttentions[s.id];
            }
        });
        creep.memory.targetSource = found_1.id;
        roomMem.sourceAttentions[found_1.id] += 1;
        target = found_1;
    }
    return target;
}
function mine(creep) {
    if (creep.memory.task !== "mine")
        creep.memory.task = "mine";
    var roomMem = creep.room.memory;
    var target = getTarget(creep);
    if (creep.store.getFreeCapacity() === 0) {
        creep.memory.targetSource = undefined;
        roomMem.sourceAttentions[target.id] -= 1;
        if (roomMem.sourceAttentions[target.id] < 0)
            roomMem.sourceAttentions[target.id] = 0;
        return WorkStatus.DONE;
    }
    if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
    }
    return WorkStatus.WORKING;
}

var tasks = {
    mine: mine,
    build: build,
    deposit: deposit,
    maintain: maintain
};

var builder = function (creep) {
    if (creep.store.getUsedCapacity() === 0) {
        // TODO: Pull from containers if available first
        tasks.mine(creep);
    }
    var maintainence = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: function (s) { return s.hits < s.hitsMax / 2; }
    });
    if (maintainence) {
        creep.memory.destination = maintainence.id;
        tasks.maintain(creep);
    }
    tasks.build(creep);
};

var harvester = function (creep) {
    // First try to mine
    if (creep.store.getFreeCapacity() > 0) {
        // Can collect materials
        tasks.mine(creep);
        return;
    }
    // Then try to deposit in spawner
    var spawn = Game.spawns.Spawn1;
    if (spawn.store.getFreeCapacity(RESOURCE_ENERGY)) {
        creep.memory.destination = spawn.id;
        tasks.deposit(creep);
        return;
    }
    var controller = creep.room.controller;
    if (controller) {
        if (controller.ticksToDowngrade < 15000) {
            creep.memory.destination = controller.id;
            tasks.deposit(creep);
            return;
        }
    }
    var validContainers = [
        "extension",
        "container",
    ];
    var closestContainer = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: function (s) { return validContainers.includes(s.structureType) && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0; }
    });
    if (closestContainer) {
        creep.memory.destination = closestContainer.id;
        tasks.deposit(creep);
        return;
    }
    var tower = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: function (s) { return s.structureType === "tower"; }
    });
    if (tower === null || tower === void 0 ? void 0 : tower.store.getFreeCapacity(RESOURCE_ENERGY)) {
        creep.memory.destination = tower.id;
        tasks.deposit(creep);
        return;
    }
    if (controller) {
        creep.memory.destination = controller.id;
        tasks.deposit(creep);
        return;
    }
    creep.say("oopsie");
};

var roles = {
    harvester: {
        name: "harvester",
        targetPopulation: 8,
        behavior: harvester,
        bodies: [
            [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE],
            [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
            [WORK, CARRY, MOVE], // 0
        ]
    },
    builder: {
        name: "builder",
        targetPopulation: 6,
        behavior: builder,
        bodies: [
            [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE],
            [WORK, CARRY, CARRY, MOVE, MOVE],
            [WORK, CARRY, MOVE],
        ]
    }
};

var creepBehavior = function () {
    for (var _i = 0, _a = Object.values(Game.creeps); _i < _a.length; _i++) {
        var creep = _a[_i];
        if (creep.memory.task) {
            creep.say(creep.memory.task);
            var status = tasks[creep.memory.task](creep);
            if (status === WorkStatus.WORKING)
                continue;
            creep.memory.task = undefined;
        }
        else {
            creep.say("I'm bored!");
        }
        roles[creep.memory.role].behavior(creep);
    }
};

var findMaintainableBuildings = function (room) { return room.find(FIND_STRUCTURES, {
    filter: function (s) { return (s.hits < s.hitsMax / 2 && s.structureType !== "constructedWall") || s.hits < 15000; }
}).sort(function (a, b) { return (a.hits / a.hitsMax) - (b.hits / b.hitsMax); }); };

var behave = function (tower) {
    var enemies = tower.room.find(FIND_HOSTILE_CREEPS);
    if (enemies.length) {
        tower.attack(enemies[0]);
        return;
    }
    var buildings = findMaintainableBuildings(tower.room);
    if (buildings.length) {
        tower.repair(buildings[0]);
        return;
    }
};
var towerBehavior = function () {
    Object.values(Game.rooms).forEach(function (room) {
        var towers = room.find(FIND_MY_STRUCTURES, {
            filter: function (s) { return s.structureType === "tower"; }
        });
        towers.forEach(behave);
    });
};

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var census = function () {
    var creeps = Object.entries(Memory.creeps)
        .reduce(function (out, _a) {
        var creep = _a[1];
        out[creep.role].push(creep);
        return out;
    }, { "harvester": [], "builder": [] });
    // TODO: Make this more intelligent
    var spawner = Game.spawns.Spawn1;
    var _loop_1 = function (role) {
        var targetBody = void 0;
        if (creeps[role.name].length === 0) {
            targetBody = role.bodies[role.bodies.length - 1];
            if (spawner.spawnCreep(targetBody, "" + role.name + Game.time.toString(), { dryRun: true }) !== OK)
                return "continue";
        }
        else {
            var ratio_1 = creeps[role.name].length / role.targetPopulation;
            // must be at least 1/2 pop to make largest body, 1/4 pop to make 2nd largest body, etc
            // eslint-disable-next-line @typescript-eslint/no-loop-func
            targetBody = role.bodies.find(function (v, i) { return ratio_1 > 1 / Math.pow(2, i); });
            if (!targetBody || spawner.spawnCreep(targetBody, "" + role.name + Game.time.toString(), { dryRun: true }) !== OK)
                return "continue";
        }
        var memory = {
            role: role.name
        };
        var status = spawner.spawnCreep(targetBody, "" + role.name + Game.time.toString(), {
            memory: __assign({}, memory)
        });
        if (status === OK) {
            console.log("Spawned a " + role.name + " with " + targetBody + ", and memory of " + JSON.stringify(memory));
            return { value: void 0 };
        }
        console.log("Failed to spawn! " + status);
    };
    for (var _i = 0, _a = Object.values(roles); _i < _a.length; _i++) {
        var role = _a[_i];
        var state_1 = _loop_1(role);
        if (typeof state_1 === "object")
            return state_1.value;
    }
};

var cleanMemory = function () {
    var creepNames = Object.keys(Game.creeps);
    var toRemove = [];
    Object.keys(Memory.creeps).forEach(function (creepName) {
        if (!creepNames.includes(creepName)) {
            toRemove.push(creepName);
        }
    });
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    toRemove.forEach(function (name) { return delete Memory.creeps[name]; });
};

var cleanTombs = function () {
    for (var _i = 0, _a = Object.values(Game.rooms); _i < _a.length; _i++) {
        var room = _a[_i];
        var tombs = room.find(FIND_TOMBSTONES);
        for (var _b = 0, tombs_1 = tombs; _b < tombs_1.length; _b++) {
            var tomb = tombs_1[_b];
            // TODO: Perform any role cleanup.
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete Memory.creeps[tomb.creep.name];
        }
    }
};

var planRoads = function (room) {
    var controller = room.controller;
    var sources = room.find(FIND_SOURCES);
    var nodes = [];
    if (controller) {
        nodes.push(controller.pos);
    }
    sources.forEach(function (s) { return nodes.push(s.pos); });
    var included_structures = [
        "container",
        "extension",
        "spawn",
    ];
    var structures = room.find(FIND_MY_STRUCTURES, {
        filter: function (s) { return included_structures.includes(s.structureType); }
    });
    structures.forEach(function (s) { return nodes.push(s.pos); });
    var roadPositions = new Set();
    nodes.forEach(function (n1, i) {
        for (var j = i; j < nodes.length; j++) {
            var path = PathFinder.search(n1, { pos: nodes[j], range: 1 }).path;
            path.forEach(function (p) { return roadPositions.add(p); });
        }
    });
    roadPositions.forEach(function (p) { return p.createConstructionSite(STRUCTURE_ROAD); });
};
var roomPlanning = function () {
    console.log("Executing Room Planning");
    for (var _i = 0, _a = Object.values(Game.rooms); _i < _a.length; _i++) {
        var room = _a[_i];
        planRoads(room);
    }
};

var loop = function () {
    if (Game.time % 10 === 0) {
        census();
    }
    if (Game.time % 50 === 0) {
        cleanMemory();
    }
    if (Game.time % 5 === 0) {
        cleanTombs();
    }
    if (Game.time % 1000 === 0) {
        roomPlanning();
    }
    creepBehavior();
    towerBehavior();
};

exports.loop = loop;
