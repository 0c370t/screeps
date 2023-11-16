import "./prototypes/Creep"

import { creeps } from "./globals";
import { manageCreeps, spawn } from "./manageCreeps";
import { depositTask } from "./tasks/deposit.task";
import { sourceTask } from "./tasks/source.task";
import { findTask } from "./tasks/utils";
export const loop = () => {
  manageCreeps();
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];

    if (!room.memory.tasks) room.memory.tasks = {};
    // Do all room-specific logicing here
    spawn(room);

    const roomCreeps = creeps[roomName] ?? [];

    for (const creep of roomCreeps) {
      if (!creep.memory.task) findTask(creep);
      if (creep.memory.task) {
        const target = Game.getObjectById(creep.memory.task);
        if (target instanceof Source) {
          creep.speak("Mining");
          sourceTask(creep, target);
        } else if (
          target instanceof StructureStorage ||
          target instanceof StructureController
        ) {
          creep.speak("Depositing");
          depositTask(creep, target);
        } else {
          creep.speak("Broken", target);
        }
      }
    }

    for (const source of room.find(FIND_SOURCES_ACTIVE)) {
      if (!room.memory.tasks[source.id]) {
        room.memory.tasks[source.id] = [null, null, null]; // 3 per source
      }
    }
  }
};
