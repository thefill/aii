class StackTRaceFormatter {
    public static prepareStackTrace(err: Error, stackTraces: NodeJS.CallSite[]): any {
        console.log('err');
        // console.log(err);
        console.log('stackTraces');
        console.log('doooonkey');
        return 'Error';
    }
}

setupError();

function setupError() {
    Error.prepareStackTrace = StackTRaceFormatter.prepareStackTrace;
    Error.stackTraceLimit = 10;
}

/**
 * Main aii class
 */
// tslint:disable-next-line
class Aii extends Error {
    public name: string;
    public origin: object;
    public date: Date;
    public stackTraceLimit = 10;

    constructor(origin: object, ...params: any[]) {
        super(...params);

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, Aii);
        }

        this.name = 'Aii';
        // Custom debugging information
        this.origin = origin;
        this.date = new Date();

    }

    // public toString(): string {
    //     console.log('donkey 2');
    //     console.log(Error.prepareStackTrace);
    //     // return super.toString();
    //
    //     return '';
    // }
}

// tslint:disable-next-line
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
        // try {
        this.child.throw();
        // } catch (error) {
        //     throw new Aii(error);
        // }
    }
}

const thrower = new NestedErrorThrow();
// try {
thrower.throw();
// } catch (error) {
//     console.log(error.toString());
//     console.log('-1------');
//     console.log(typeof error);
//     console.log(error.stack);
//     console.log(error.toSource());
// }
