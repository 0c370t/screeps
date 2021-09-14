import {build} from "./build";
import {deposit} from "./deposit";
import {maintain} from "./maintain";
import {mine} from "./mine";

export const tasks = {
    mine,
    build,
    deposit,
    maintain,
};
export type AvailableTasks = keyof typeof tasks;
