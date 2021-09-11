import {build} from "./build";
import {depositAtExtension} from "./depositAtExtension";
import {depositAtRoomController} from "./depositAtRc";
import {depositAtSpawner} from "./depositAtSpawner";
import {mine} from "./mine";

export const tasks = {
    mine,
    depositAtRoomController,
    depositAtSpawner,
    build,
    depositAtExtension,
};
export type AvailableTasks = keyof typeof tasks;
