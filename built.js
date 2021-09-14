'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

var harvester = {
  targetPopulation: 8,
  bodies: [[WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE], [WORK, WORK, CARRY, CARRY, MOVE, MOVE], [WORK, CARRY, MOVE]]
};

var roles = {
  harvester: harvester
};

function canSpawnBody(preferredSpawner, b) {
  return preferredSpawner.spawnCreep(b, "", {
    dryRun: true
  }) === OK;
}

var census = function census(room) {
  console.log("Executing Census for room ".concat(room.name));
  var preferredSpawner = room.find(FIND_MY_SPAWNS).reduce(function (p, c) {
    return (p === null || p === void 0 ? void 0 : p.store) && p.store.getUsedCapacity(RESOURCE_ENERGY) > c.store.getUsedCapacity(RESOURCE_ENERGY) ? p : c;
  }, undefined); // No spawner, no point;

  if (!preferredSpawner) return;
  var creeps = room.find(FIND_MY_CREEPS);
  var currentPopulation = creeps.reduce(function (out, creep) {
    out[creep.memory.role] += 1;
    return out;
  }, {
    "harvester": 0
  }); // Use find instead of forEach to let us bail out when we need to

  Object.entries(currentPopulation).find(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        roleName = _ref2[0],
        population = _ref2[1];

    // Get the role
    var role = roles[roleName]; // Check current population

    if (population >= role.targetPopulation) {
      // Population is correct, keep goin'
      return false;
    } // Pre-set memory


    var memory = {
      role: roleName
    }; // Identify target body

    var targetBody;

    if (role.bodies.length === 1 || population === 0) {
      /*
       * If there is only 1 type, or there are no screeps
       * Use the last (cheapest) body
       */
      targetBody = role.bodies[role.bodies.length - 1];
    } else {
      // Get current population ratio
      var ratio = population / role.targetPopulation;
      /**
       * Find which bodies are allowed for this population
       * Such that [a,b,c]
       * ratio > 1.2 ^ 1 (0.83) -> a is allowed
       * ratio > 1.2 ^ 2 (0.69) -> b is allowed
       * ratio > 1.2 ^ 3 (0.57) -> c is allowed
       * .
       * In theory, if a population is 85% full; only the first body will be allowed
       * If a population is ~70% full, the first and second (which is cheaper) will be allowed
       */

      var availableBodies = role.bodies.reverse().filter(function (a, i) {
        return ratio > 1 / Math.pow(1.2, i);
      });
      var spawnable = availableBodies.find(function (b) {
        return canSpawnBody(preferredSpawner, b);
      });
      if (!spawnable) return false;
      targetBody = spawnable;
    }

    preferredSpawner.spawnCreep(targetBody, "".concat(roleName).concat(Game.time), {
      memory: memory
    });
    return true;
  });
};

var _marked = [[room_management, "cdb0b45386305317b4ff0affad326344"]].map(function (arr) {
  return regeneratorRuntime.mark(arr[0], arr[1]);
});
function room_management() {
  return regeneratorRuntime.wrap(function room_management$(_locals, _context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:

          for (_locals._i = 0, _locals._Object$values = Object.values(Game.rooms); _locals._i < _locals._Object$values.length; _locals._i++) {
            _locals.room = _locals._Object$values[_locals._i];

            if (Game.time % 10 === 0) {
              census(_locals.room);
            }
          }

          _context.next = 4;
          return {};

        case 4:
          _context.next = 0;
          break;

        case 6:
        case "end":
          return _context.stop();
      }
    }
  }, _marked[0], [], null, this, arguments);
}

var routines = {
  room_management: room_management
};

// import "screeps-regenerator-runtime/runtime";

function executeThread(title) {
  var thread;

  if (Memory.threads[title]) {
    try {
      thread = regeneratorRuntime.deserializeGenerator(Memory.threads[title]);
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete Memory.threads[title];
    }
  } else {
    thread = routines[title]();
  }

  var result = thread.next();

  if (!result.done) {
    Memory.threads[title] = regeneratorRuntime.serializeGenerator(thread);
  }
}

function loop() {
  if (!Memory.threads) Memory.threads = {
    "room_management": {}
  };
  executeThread("room_management");
}

exports.loop = loop;
