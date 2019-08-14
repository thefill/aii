declare class Aii extends Error {
    origin: object;
    date: Date;
    constructor(origin: object, ...params: any[]);
}
declare class NestedErrorThrow {
    lvl: number;
    child: NestedErrorThrow;
    maxLvl: number;
    lastLvl: boolean;
    constructor(lvl?: number);
    nest(): void;
    throw(): void;
}
declare const thrower: NestedErrorThrow;
