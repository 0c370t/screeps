import { creeps } from "./globals";
import { manageCreeps } from "./manageCreeps";
export const loop = () => {
  manageCreeps();
  for (const [room, roomCreeps] of Object.entries(creeps)) {
    // Do all room-specific logicing here

  }
};
