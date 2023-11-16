export const finishTask = (creep: Creep, nextId?: CreepMemory["task"]) => {
  creep.speak("Work Complete");
  if (creep.memory.task && creep.memory.task in creep.room.memory.tasks) {
    console.log(
      creep.room.memory.tasks[creep.memory.task],
      Object.keys(creep.room.memory.tasks),
      creep.memory.task
    );
    const creepTaskIdx = creep.room.memory.tasks[creep.memory.task]?.indexOf(
      creep.name
    );
    creep.room.memory.tasks[creep.memory.task][creepTaskIdx] = null;
    // TODO: When should the task be removed from the room
  }

  creep.memory.task = nextId;
};

export const findTask = (creep: Creep) => {
  // TODO: Future check that creep has correct body parts

  
  const task = Object.entries(creep.room.memory.tasks).reduce((a, [targetId, assignees]) => {
    if (assignees.indexOf(null) === -1) return a;
    const target = Game.getObjectById(targetId as TaskId)
    if (!target) return a;
    const pf = PathFinder.search(creep.pos, target.pos)  
    if (pf.cost < a.distance) {
        return { targetId, distance: pf.cost }
    } else {
        return a;
    }
  }, { targetId: null, distance: Number.MAX_SAFE_INTEGER })


  

  if (!task.targetId) {
    creep.speak("Bored");
    return;
  }

  // Replace first null with this creep
  const idx = creep.room.memory.tasks[task.targetId].indexOf(null)
  creep.room.memory.tasks[task.targetId][idx] = creep.name;
  creep.memory.task = task.targetId as TaskId;
};
