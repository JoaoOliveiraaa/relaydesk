import { ConsoleLogger, LogLevel } from '@nestjs/common';
export declare class RelayLogger extends ConsoleLogger {
    constructor(context?: string);
    static levelsForEnv(nodeEnv: string | undefined): LogLevel[];
}
//# sourceMappingURL=relay-logger.d.ts.map