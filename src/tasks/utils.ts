export const finishTask = (creep: Creep, nextId?: CreepMemory["task"]) => {
  creep.speak("Work Complete")
  if (creep.memory.task) {
    const creepTaskIdx = creep.room.memory.tasks[creep.memory.task].indexOf(
      creep.name
    );
    creep.room.memory.tasks[creep.memory.task][creepTaskIdx] = null;
    // TODO: When should the task be removed from the room
  }

  creep.memory.task = nextId;
};

export const findTask = (creep: Creep) => {
  // TODO: Future check that creep has correct body parts
  const task = Object.entries(creep.room.memory.tasks).find(
    ([k, v]) => v.indexOf(null) >= 0
  );

  if (!task) {
    creep.speak("Bored")
    return;
  }

  // Replace first null with this creep
  const idx = task[1].indexOf(null);
  task[1][idx] = creep.name;
  creep.memory.task = task[0] as TaskId;
};
