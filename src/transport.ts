import pino from 'pino';
import type { Transport, LogEntry } from '@vevkit/saga';
import type { PinoTransportConfig } from './types';

type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
type LogMethod = (obj: object | string, msg?: string) => void;

export class PinoTransport implements Transport {
  private logger: pino.Logger;
  private levelMap: Record<string, LogLevel> = {
    critical: 'fatal',
    error: 'error',
    warn: 'warn',
    info: 'info',
    debug: 'debug',
    trace: 'trace'
  };

  constructor(private config: PinoTransportConfig = {}) {
    this.logger = config.instance || pino({
      serializers: {
        err: pino.stdSerializers.err,
        ...config.serializers
      }
    });
  }

  async log(entry: LogEntry): Promise<void> {
    const pinoLevel = this.levelMap[entry.level] || 'info';
    const logMethod = this.logger[pinoLevel] as LogMethod;
    
    if (logMethod) {
      logMethod.call(this.logger, entry.metadata || {}, entry.message);
    } else {
      // Fallback to info level if somehow we get an unmapped level
      this.logger.info(entry.metadata || {}, entry.message);
    }
  }

  async close(): Promise<void> {
    await this.logger.flush();
  }
}