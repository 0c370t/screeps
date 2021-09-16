export interface Role {
    defaultBody: BodyPartConstant[];
    extraPart: BodyPartConstant[];
    maxPartLookup: Record<RoomLevel, number>;
    targetPopulation: number;
}
