import type { Logger as PinoLogger } from 'pino';

export interface PinoTransportConfig {
  instance?: PinoLogger;
  serializers?: {
    [key: string]: (value: any) => any;
  };
  worker?: {
    enabled: boolean;
    options?: any;
  };
}