import { creeps } from "./globals";
import { manageCreeps, spawn } from "./manageCreeps";
export const loop = () => {
  manageCreeps();
  for (const room in Game.rooms) {
    // Do all room-specific logicing here
    spawn(room);
  }
};
