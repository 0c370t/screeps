import type {VirtualRoom} from "../../virtuals/VirtualRoom";
import { AvailableDirective } from "./types";

export const createDirectives = (room: VirtualRoom) => {
    const controller = room.room.controller;


    if (controller) {
        // Fall back to putting energy in the controller
        const bestSource = room.findBestSource(controller.pos);
        if (bestSource) {
        const controllerDirective: AvailableDirective = {
            steps: [
                {
                    type: "mine",
                    target: bestSource
                },
                {
                    type: "deposit",
                    target: controller.id
                }
            ],
            roles: ["laborer"],
            availableCount: 4
        }
        room.addDirective(controllerDirective);
        }

    }

    console.log("Created Directives")
};
