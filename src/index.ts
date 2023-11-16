import { creeps } from "./globals";
import { manageCreeps } from "./manageCreeps";
export const loop = () => {
  manageCreeps();
  for (const [room, roomCreeps] of Object.entries(creeps)) {
    console.log(room, roomCreeps.map((c) => c.name).join(", "));
  }
};
