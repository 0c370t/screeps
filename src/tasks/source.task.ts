import { DEFAULT_MOVE_OPTS } from "../constants";
import { finishTask } from "./utils";

export const sourceTask = (creep: Creep, target: Source) => {
  const r = creep.harvest(target);
  switch (r) {
    case ERR_NOT_IN_RANGE:
      creep.moveTo(target, DEFAULT_MOVE_OPTS);
      break;
    case OK:
      if (creep.store.getFreeCapacity() === 0) {
        // Creep is full
        if (!creep.room.controller)
          throw new Error("Creep is full in a room without a controller");
        finishTask(creep, creep.room.controller.id)
      }
      break;
  }
};
