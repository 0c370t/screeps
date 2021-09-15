export const CreepPathStyle = {
    fill: "transparent",
    stroke: "#fff",
    lineStyle: "dashed" as const,
    strokeWidth: 0.15,
    opacity: 0.1,
};


export enum Priority {
    EXTREME = 10,
    VERY_HIGH = 8,
    HIGH = 6,
    NORMAL = 5,
    LOW = 3,
    WHENEVER = 1,
}
