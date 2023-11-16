import { creeps } from "./globals";

export const manageCreeps = () => {
  if (Game.time % 100 === 0) {
    // Cleanup Memory
    for (const name in Memory.creeps) {
      if (!(name in Game.creeps)) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete Memory.creeps[name];
      }
    }
  }

  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    if (!creep.my) {
      continue;
    }
    const room = creep.memory.room || creep.room.name;
    creeps[room] = creeps[room] || [];
    creeps[room].push(creep);
  }
};

export const spawn = (r: Room | Room["name"]) => {
  if (typeof r === "string") r = Game.rooms[r];

  const roomCreeps = creeps[r.name];
  let body: BodyPartConstant[] = [];
  let role: string = "";
  if (roomCreeps.length < 3) {
    // Short on hands, spawn some basic boys
    if (r.energyAvailable >= 250) {
      body = ["work", "carry", "move", "move"];
      role = "basic-worker";
    }
  }

  if (body.length) {
    // find a spawn
    const spawns = r.find(FIND_MY_SPAWNS, {
      filter: (s) => !Boolean(s.spawning),
    });
    if (spawns.length) {
      const spawnStatus = spawns
        .pop()
        ?.spawnCreep(
          body,
          [r.name, Game.time, role].filter(Boolean).join(":"),
          {
            memory: {
              room: r.name,
              role: role,
            },
          }
        );
        if (spawnStatus === OK) {
          console.log("Spawned a screep!")
        } else {
          console.log("Failed to spawn a screep!", spawnStatus)
        }
    }
  }
};
