
# @vevkit/saga-pino

Pino transport for [@vevkit/saga](https://github.com/VevKit/saga) logger.

## Installation

```bash
npm install @vevkit/saga-pino pino pino-pretty
```

## Usage

### Basic Usage

```typescript
import { Logger } from '@vevkit/saga';
import { PinoTransport } from '@vevkit/saga-pino';

const logger = new Logger({
  transports: [
    new PinoTransport()
  ]
});

logger.info('Hello from VevKit!');
```

### Pretty Printing

Enable pretty printing for development:

```typescript
const logger = new Logger({
  transports: [
    new PinoTransport({
      pretty: true // Uses default pretty printing options
    })
  ]
});
```

Customize pretty printing:

```typescript
const logger = new Logger({
  transports: [
    new PinoTransport({
      pretty: {
        colorize: true,
        translateTime: 'UTC:yyyy-mm-dd HH:MM:ss',
        ignore: 'hostname,pid'
      }
    })
  ]
});
```

### Custom Serializers

Add custom serializers for specific properties:

```typescript
const logger = new Logger({
  transports: [
    new PinoTransport({
      serializers: {
        user: (user) => ({
          id: user.id,
          role: user.role
          // Omit sensitive information
        })
      }
    })
  ]
});

logger.info('User action', { 
  user: { 
    id: 123, 
    role: 'admin',
    password: 'secret' // Will be omitted by serializer
  }
});
```

### Custom Pino Instance

Use your own Pino instance:

```typescript
import pino from 'pino';

const pinoInstance = pino({
  // Your custom Pino configuration
});

const logger = new Logger({
  transports: [
    new PinoTransport({
      instance: pinoInstance
    })
  ]
});
```

## API Reference

### PinoTransportConfig

```typescript
interface PinoTransportConfig {
  // Optional custom Pino instance
  instance?: pino.Logger;
  
  // Custom serializers
  serializers?: {
    [key: string]: (value: any) => any;
  };
  
  // Pretty printing configuration
  pretty?: boolean | PinoPrettyOptions;
}

interface PinoPrettyOptions {
  colorize?: boolean;
  levelFirst?: boolean;
  translateTime?: boolean | string;
  ignore?: string;
  messageKey?: string;
  customPrettifiers?: Record<string, (input: any) => string>;
}
```

## Log Level Mapping

VevKit Saga levels are mapped to Pino levels as follows:

| Saga Level | Pino Level |
|------------|------------|
| critical   | fatal      |
| error      | error      |
| warning    | warn       |
| info       | info       |
| debug      | debug      |
| trace      | trace      |

## License

MIT
```