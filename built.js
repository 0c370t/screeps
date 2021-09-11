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

var builder = function (creep) {
    if (creep.store.getUsedCapacity() === 0) {
        // TODO: Pull from containers if available first
        mine(creep);
    }
    // TODO: Maintainence
    build(creep);
};

function depositAtExtension(creep) {
    if (creep.memory.task === undefined)
        creep.memory.task = "depositAtExtension";
    if (creep.store.getFreeCapacity() === creep.store.getCapacity()) {
        // Creep has finished task
        creep.memory.task = undefined;
        return WorkStatus.DONE;
    }
    var closestExtension = creep.memory.desintation
        ? Game.getObjectById(creep.memory.desintation)
        : creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: function (s) { return s.structureType === "extension" && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0; }
        });
    if (!closestExtension) {
        creep.memory.task = undefined;
        creep.memory.desintation = undefined;
        return WorkStatus.DONE;
    }
    switch (creep.transfer(closestExtension, RESOURCE_ENERGY)) {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(closestExtension);
            return WorkStatus.WORKING;
        case ERR_FULL:
            return WorkStatus.DONE;
        default: return WorkStatus.WORKING;
    }
}

function depositAtRoomController(creep) {
    if (creep.memory.task === undefined)
        creep.memory.task = "depositAtRoomController";
    if (creep.store.getFreeCapacity() === creep.store.getCapacity()) {
        // Creep has completed the task
        creep.memory.task = undefined;
        return WorkStatus.DONE;
    }
    var controller = creep.room.controller;
    if (controller) {
        var attempt = creep.transfer(controller, RESOURCE_ENERGY);
        if (attempt === ERR_NOT_IN_RANGE)
            creep.moveTo(controller);
    }
    return WorkStatus.WORKING;
}

function depositAtSpawner(creep) {
    if (creep.memory.task === undefined)
        creep.memory.task = "depositAtSpawner";
    if (creep.store.getFreeCapacity() === creep.store.getCapacity()) {
        // Creep has finished task
        creep.memory.task = undefined;
        return WorkStatus.DONE;
    }
    var spawn = Game.spawns.Spawn1;
    switch (creep.transfer(spawn, RESOURCE_ENERGY)) {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(spawn);
            return WorkStatus.WORKING;
        case ERR_FULL:
            return WorkStatus.DONE;
        default: return WorkStatus.WORKING;
    }
}

var tasks = {
    mine: mine,
    depositAtRoomController: depositAtRoomController,
    depositAtSpawner: depositAtSpawner,
    build: build,
    depositAtExtension: depositAtExtension
};

var harvester = function (creep) {
    // First try to mine
    if (creep.store.getFreeCapacity() > 0) {
        // Can collect materials
        creep.memory.task = "mine";
        if (tasks.mine(creep))
            return;
    }
    // Then try to deposit in spawner
    var spawn = Game.spawns.Spawn1;
    if (spawn.store.getFreeCapacity(RESOURCE_ENERGY)) {
        creep.memory.task = "depositAtSpawner";
        if (tasks.depositAtSpawner(creep))
            return;
    }
    // Then try to deposit at room controller
    creep.memory.task = "depositAtRoomController";
    tasks.depositAtRoomController(creep);
};

var roles = {
    harvester: {
        name: "harvester",
        targetPopulation: 6,
        behavior: harvester,
        bodies: [
            [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
            [WORK, CARRY, MOVE],
        ]
    },
    builder: {
        name: "builder",
        targetPopulation: 3,
        behavior: builder,
        bodies: [
            [WORK, CARRY, MOVE],
        ]
    }
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

var log$1 = function (s) { console.log("CENSUS | " + s); };
var census = function () {
    log$1("Running census!");
    var creeps = Object.entries(Memory.creeps)
        .reduce(function (out, _a) {
        var creep = _a[1];
        out[creep.role].push(creep);
        return out;
    }, { "harvester": [], "builder": [] });
    // TODO: Make this more intelligent
    var spawner = Game.spawns.Spawn1;
    for (var _i = 0, _a = Object.values(roles); _i < _a.length; _i++) {
        var role = _a[_i];
        if (creeps[role.name].length < role.targetPopulation) {
            // Attempt to Spawn Creep
            for (var _b = 0, _c = role.bodies; _b < _c.length; _b++) {
                var body = _c[_b];
                if (spawner.spawnCreep(body, "" + role.name + Game.time.toString(), { dryRun: true }) === OK) {
                    var memory = {
                        role: role.name
                    };
                    spawner.spawnCreep(body, "" + role.name + Game.time.toString(), {
                        memory: __assign({}, memory)
                    });
                    console.log("Spawned a " + role.name + " with " + body + ", and memory of " + JSON.stringify(memory));
                    return;
                }
            }
            // We won't be able to spawn any of this role, keep moving
            continue;
        }
    }
};

var log = function (s) { console.log("MEMCLEAN | " + s); };
var cleanMemory = function () {
    log("Cleaning Memory");
    var creepNames = Object.keys(Game.creeps);
    var toRemove = [];
    Object.keys(Memory.creeps).forEach(function (creepName) {
        if (!creepNames.includes(creepName)) {
            toRemove.push(creepName);
        }
    });
    log("Deleting stale memory entries: " + JSON.stringify(toRemove));
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
    for (var _i = 0, _a = Object.values(Game.creeps); _i < _a.length; _i++) {
        var creep = _a[_i];
        if (creep.memory.task) {
            var status = tasks[creep.memory.task](creep);
            if (status === WorkStatus.WORKING)
                continue;
            creep.memory.task = undefined;
        }
        roles[creep.memory.role].behavior(creep);
    }
};

exports.loop = loop;
