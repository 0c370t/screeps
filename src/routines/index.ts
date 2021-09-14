import {room_management} from "./room_management";

export const routines = {
    room_management: room_management,
};

export type RoutineName = keyof typeof routines;
