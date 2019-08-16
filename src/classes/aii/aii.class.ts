import {AiiUtils} from './aii-utils.class';

AiiUtils.setupError();

/**
 * Main aii class
 */
export class Aii extends Error {
    public name: string;
    public origin: object;
    public date: Date;

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
}
