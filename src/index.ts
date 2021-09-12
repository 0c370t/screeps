import {creepBehavior} from "./creeps";
import {towerBehavior} from "./towers";
import {census} from "./utils/census";
import {cleanMemory} from "./utils/clean_memory";
import {cleanTombs} from "./utils/clean_tombs";
import {roomPlanning} from "./utils/room_planning";

export const loop = () => {
    if (Game.time % 10 === 0) {
        census();
    }

    if (Game.time % 50 === 0) {
        cleanMemory();
    }

    if (Game.time % 5 === 0) {
        cleanTombs();
    }

    if (Game.time % 1000 === 0) {
        roomPlanning();
    }

    creepBehavior();
    towerBehavior();
};
