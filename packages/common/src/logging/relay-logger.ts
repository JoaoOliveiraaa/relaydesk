import { ConsoleLogger, Injectable, LogLevel, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class RelayLogger extends ConsoleLogger {
  constructor(context?: string) {
    super(context ?? 'RelayDesk', { timestamp: true });
  }

  static levelsForEnv(nodeEnv: string | undefined): LogLevel[] {
    if (nodeEnv === 'production') {
      return ['error', 'warn', 'log'];
    }
    return ['error', 'warn', 'log', 'debug', 'verbose'];
  }
}
