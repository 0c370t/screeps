import {creep_behaviors} from "./creep_behaviors";
import {room_management} from "./room_management";

export const routines = {
    room_management: room_management,
    creep_behaviors: creep_behaviors,
};

export type RoutineName = keyof typeof routines;
