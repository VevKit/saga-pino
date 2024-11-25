# @vevkit/saga-pino

Pino transport for @vevkit/saga logger.

## Installation

```bash
npm install @vevkit/saga-pino pino @vevkit/saga

## Usage

```typescript
import { Logger } from '@vevkit/saga';
import { PinoTransport } from '@vevkit/saga-pino';

const logger = new Logger({
  transports: [
    new PinoTransport()
  ]
});
```