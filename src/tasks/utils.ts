export const finishTask = (creep: Creep, nextId?: CreepMemory["task"]) => {
  if (creep.memory.task) {
    const creepTaskIdx = creep.room.memory.tasks[creep.memory.task].indexOf(
      creep.name
    );
    creep.room.memory.tasks[creep.memory.task][creepTaskIdx] = null;
    // TODO: When should the task be removed from the room
  }

  creep.memory.task = nextId
};
