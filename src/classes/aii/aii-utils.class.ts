import chalk from 'chalk';
import {readFileSync} from 'fs';
import {Aii} from './aii.class';
import {ISimplifiedTrace} from './aii.interface';

export class AiiUtils {
    public static prepareStackTrace(error: Aii, ddd): any {
        try {
            const message: string[] = [];
            const traces = AiiUtils.setupTraces(error);
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
                ...divider,
                chalk.gray('RAW ERROR')
            );

            AiiUtils.printMessage(message);

            // return string with white space to suppress any other output
            return ' ';
        } catch (error) {
            // tslint:disable-next-line
            console.error(`Unable to produce error output due to ${error.toString()}`);
        }
    }

    public static getErrorSummary(error: Aii, traces: ISimplifiedTrace[]): string[] {
        const lastTrace = traces[traces.length - 1];

        return [
            `${chalk.yellow('ERROR:')}  ${chalk.red(error.message)}`,
            // tslint:disable-next-line
            `${chalk.yellow('ORIGIN:')} ${lastTrace.functionName} | line ${lastTrace.lineNumber} | column ${lastTrace.columnNumber}`,
            `${chalk.yellow('FILE:')}   ${lastTrace.fileName}`,
            `${chalk.yellow('DATE:')}   ${error.date}`
        ];
    }

    public static getErrorSnapshot(traces: ISimplifiedTrace[]): string[] {
        const lastTrace = traces[traces.length - 1];
        const printMargin = 5;
        const message: string[] = [];

        // Read file that throwed error and extract lines
        const fileLines = readFileSync(lastTrace.fileName).toString().split('\n');

        // get snapshot start line
        let startLine = lastTrace.lineNumber - printMargin - 1;
        startLine = startLine < 0 ? 0 : startLine;

        // get snapshot end line
        let endLine = lastTrace.lineNumber + printMargin + 1;
        endLine = endLine <= fileLines.length ? endLine - 1 : fileLines.length;

        // extract affected code
        const lines = fileLines.slice(startLine, endLine);

        message.push(`SNAPSHOT ${chalk.grey('─┐')}`);
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const currentLine = startLine + i + 1;

            // adjust line numbers
            let lineNumber = `       ${currentLine}`;
            lineNumber = lineNumber.length > 9 ? lineNumber.slice(Math.abs(lineNumber.length - 9)) : lineNumber;
            lineNumber = chalk.grey(lineNumber);

            // if error line
            if (currentLine !== lastTrace.lineNumber) {
                message.push(`${lineNumber} ${chalk.grey('│')} ${line}`);
            } else {
                message.push(`${lineNumber} ${chalk.red('☒')} ${chalk.red(line)}`);
                const emptySpaces = new Array(lastTrace.columnNumber).fill(' ').join('');
                message.push(`          ${chalk.grey('│')} ${emptySpaces}${chalk.yellow('^')}`);
            }
        }

        return message;
    }

    public static setupTraces(error: Aii): ISimplifiedTrace[] {
        let rawStack = (error.stack as string).split('\n');
        rawStack.shift();
        // reverse the order
        rawStack = rawStack
            .reverse()
            .map((entry) => {
                return entry.replace('    at ', '');
            })
            .filter((entry) => {
                // remove process stack entries (possible top level)
                return !entry.match(/^Object\./) && !entry.match(/^Module\./);
            });

        return rawStack
            .map((trace) => {
                trace = trace.trim();
                const functionNameMatch: null | RegExpMatchArray = trace.match(/^.*\s/);
                const fileNameMatch: null | RegExpMatchArray = trace.match(/\s\((.*)\:.*\:/);
                const lineNumberMatch: null | RegExpMatchArray = trace.match(/\(.*\:(.*):/);
                const columnNumberMatch: null | RegExpMatchArray = trace.match(/:.*:(.*)\)/);

                const functionName = functionNameMatch && functionNameMatch.length ? functionNameMatch[0].trim() : '';
                const fileName = fileNameMatch && fileNameMatch.length ? fileNameMatch[1].trim() : '';
                const lineNumber = lineNumberMatch && lineNumberMatch.length ?
                    Number.parseInt(lineNumberMatch[1].trim(), 10) : -1;
                const columnNumber = columnNumberMatch && columnNumberMatch.length ?
                    Number.parseInt(columnNumberMatch[1].trim(), 10) : -1;

                return {functionName, fileName, lineNumber, columnNumber};
            })
            .filter((trace) => {
                return trace.functionName && trace.fileName && trace.lineNumber !== -1 && trace.columnNumber !== -1;
            });
    }

    public static getTraceMessage(traces: ISimplifiedTrace[]): string[] {
        const message: string[] = [];

        // set trace details for the end message
        message.push(`TRACE ${chalk.grey('─┐')}`);
        for (let i = 0; i < traces.length; i++) {
            const trace = traces[i];

            let functionName = chalk.green(trace.functionName);
            let statusIcon = chalk.green('☑');
            let prelastLineSpacer = chalk.grey('├─');
            let lastLineSpacer = chalk.grey('│');

            // if last trace
            if (i + 1 >= traces.length) {
                prelastLineSpacer = chalk.grey('└─');
                statusIcon = chalk.red('☒');
                lastLineSpacer = ' ';
                functionName = chalk.red(trace.functionName);
            }

            const lineNumber = chalk.grey(`| line ${trace.lineNumber}`);
            const columnNumber = chalk.grey(`| column ${trace.columnNumber}`);

            message.push(
                // tslint:disable-next-line
                `       ${prelastLineSpacer}${statusIcon}  ${functionName} ${lineNumber} ${columnNumber}`,
                chalk.grey(`       ${lastLineSpacer}    ${trace.fileName.slice(1)}`)
            );
        }

        return message;
    }

    public static getDivider(): string[] {
        const stdoutWidth = process.stdout.columns;
        const divider = chalk.grey(new Array(stdoutWidth).fill('─').join(''));

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
