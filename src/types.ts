import type { Logger as PinoLogger } from 'pino';

export interface PinoPrettyOptions {
  colorize?: boolean;
  levelFirst?: boolean;
  translateTime?: boolean | string;
  ignore?: string;
  messageKey?: string;
  customPrettifiers?: Record<string, (input: any) => string>;
}

export interface PinoTransportConfig {
  instance?: PinoLogger;
  serializers?: {
    [key: string]: (value: any) => any;
  };
  worker?: {
    enabled: boolean;
    options?: any;
  };
  pretty?: boolean | PinoPrettyOptions;
}