class AiiUtils {
    public static prepareStackTrace(error: Aii, stackTraces: NodeJS.CallSite[]): any {
        const message: string[] = [];
        const traces = AiiUtils.setupTraces(stackTraces);
        const divider = AiiUtils.getDivider();

        // set general details for the end message
        const errorSummary = AiiUtils.getErrorSummary(error, traces);
        const errorTrace = AiiUtils.getTraceMessage(traces);
        const errorSnapshot = AiiUtils.getErrorSnapshot(traces);

        // compose error message
        message.push(
            ...divider,
            ...errorSummary,
            ...divider,
            ...errorTrace,
            ...divider,
            ...errorSnapshot,
            ...divider
        );

        AiiUtils.printMessage(message);

        // return string with white space to suppress any other output
        return ' ';
    }

    public static getErrorSummary(error: Aii, traces: ISimplifiedTrace[]): string[] {
        const lastTrace = traces[traces.length - 1];

        return [
            `ERROR:  ${error.message}`,
            `ORIGIN: ${lastTrace.functionName} | line ${lastTrace.lineNumber} | column ${lastTrace.columnNumber}`,
            `FILE:   ${lastTrace.fileName}`,
            `DATE:   ${error.date}`
        ];
    }

    public static getErrorSnapshot(traces: ISimplifiedTrace[]): string[] {
        const lastTrace = traces[traces.length - 1];
        const printMargin = 5;
        // TODO: implement
        const message: string[] = [];

        return message;
    }

    public static setupTraces(stackTraces: NodeJS.CallSite[]): ISimplifiedTrace[] {
        // reverse the order
        stackTraces = stackTraces.reverse().filter((entry) => {
            return entry.getThis() && entry.getFunctionName();
        });

        // simplify data
        const traces: ISimplifiedTrace[] = stackTraces.map((trace) => {
            return {
                this: trace.getThis() as any,
                functionName: trace.getFunctionName() as string,
                methodName: trace.getMethodName() as string,
                fileName: trace.getFileName() as string,
                lineNumber: trace.getLineNumber() as number,
                columnNumber: trace.getColumnNumber() as number
            };
        });

        // remove process stack entries (possible top level)
        const validTraces: ISimplifiedTrace[] = [];
        for (const trace of traces) {
            // if process entry
            if (trace.functionName && trace.functionName.match(/^process\./)) {
                // stop processing
                break;
            }

            // else add to processed stack
            validTraces.push(trace);
        }

        return validTraces;
    }

    public static getTraceMessage(traces: ISimplifiedTrace[]): string[] {
        const message: string[] = [];

        // set trace details for the end message
        message.push('TRACE ─┐');
        for (let i = 0; i < traces.length; i++) {
            const trace = traces[i];

            let statusIcon = '☑';
            let prelastLineSpacer = '├─';
            let lastLineSpacer = '│';
            // if last trace
            if (i + 1 >= traces.length) {
                prelastLineSpacer = '└─';
                statusIcon = '☒';
                lastLineSpacer = ' ';
            }

            message.push(
                `       ${prelastLineSpacer}${statusIcon}  ${trace.functionName} | line ${trace.lineNumber} | column ${trace.columnNumber}`,
                `       ${lastLineSpacer}    ${trace.fileName.slice(1)}`
            );
        }

        return message;
    }

    public static getDivider(): string[] {
        const stdoutWidth = process.stdout.columns;
        const divider = new Array(stdoutWidth).fill('─').join('');

        return [
            '',
            divider,
            ''
        ];
    }

    public static printMessage(message: string[]) {
        for (const partials of message) {
            // tslint:disable
            console.log(partials);
            // tslint:enable
        }
    }

    public static setupError() {
        Error.prepareStackTrace = AiiUtils.prepareStackTrace;
        Error.stackTraceLimit = 10;
    }
}

AiiUtils.setupError();

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

new NestedErrorThrow().throw();

interface ISimplifiedTrace {
    this: any;
    functionName: string;
    methodName: string;
    fileName: string;
    lineNumber: number;
    columnNumber: number;
}
