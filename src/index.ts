// Export classes and interfaces just in case
import {Aii} from './classes/aii';

export * from './classes';

class NestedErrorThrow {
    public lvl: number;
    public child: NestedErrorThrow;
    public maxLvl = 5;
    public lastLvl = false;

    constructor(lvl = 0) {
        this.lvl = lvl;
        this.lastLvl = this.lvl === this.maxLvl;
        this.nest();
    }

    public nest() {
        if (!this.lastLvl) {
            this.child = new NestedErrorThrow(this.lvl + 1);
        }
    }

    public throw() {
        if (this.lastLvl) {
            throw new Aii(this, `Error message for level ${this.lvl}`);
        }
        this.child.throw();
    }
}

new NestedErrorThrow().throw();
