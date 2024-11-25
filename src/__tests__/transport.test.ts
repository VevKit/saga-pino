// test/transport.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert';
import pino from 'pino';
import { PinoTransport } from '../';
import { LogEntry, LogLevel, LOG_SYMBOLS } from '@vevkit/saga';

type PinoLogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
type LogMethod = (obj: object | string, msg?: string) => void;
type PinoInstance = pino.Logger;

type LogArgs = [obj: object | string, msg?: string];

describe('PinoTransport', () => {
  it('should create instance with default config', () => {
    const transport = new PinoTransport();
    assert.ok(transport instanceof PinoTransport);
  });

  it('should properly map log levels', async () => {
    const logs: Array<{ level: PinoLogLevel; args: any[] }> = [];
    const mockPino = pino({
      level: 'trace',
      transport: {
        target: 'pino/file',
        options: { destination: 1 }
      }
    });

    // Override write methods to capture logs
    const levels: PinoLogLevel[] = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];
    levels.forEach(level => {
      const originalMethod = (mockPino[level] as LogMethod).bind(mockPino);
      (mockPino as any)[level] = (obj: object | string, msg?: string) => {
        logs.push({ level, args: [obj, msg].filter(Boolean) as LogArgs });
        originalMethod(obj, msg);
      };
    });

    const transport = new PinoTransport({ instance: mockPino });

    // Test each log level
    const testCases: Array<[LogLevel, PinoLogLevel]> = [
      ['critical', 'fatal'],
      ['error', 'error'],
      ['warning', 'warn'],
      ['info', 'info'],
      ['debug', 'debug'],
    ];

    for (const [sagaLevel, expectedPinoLevel] of testCases) {
      const entry: LogEntry = {
        level: sagaLevel,
        message: `Test ${sagaLevel} message`,
        metadata: { test: sagaLevel },
        symbol: LOG_SYMBOLS[sagaLevel],
        timestamp: new Date()
      };

      await transport.log(entry);
      
      const relevantLog = logs.find(log => 
        log.level === expectedPinoLevel && 
        log.args[0].test === sagaLevel
      );

      assert.ok(relevantLog, `Should find log for ${sagaLevel} -> ${expectedPinoLevel}`);
      assert.equal(relevantLog.args[1], entry.message);
    }
  });

  it('should handle metadata correctly', async () => {
    const logs: Array<{ level: string; args: any[] }> = [];
    const mockPino = pino({
      level: 'trace',
      transport: {
        target: 'pino/file',
        options: { destination: 1 }
      }
    }) as PinoInstance;

    (mockPino as any).info = (...args: any[]) => {
      logs.push({ level: 'info', args });
    };

    const transport = new PinoTransport({ instance: mockPino });
    
    const testCases = [
      { 
        entry: {
          level: 'info',
          message: 'Test with metadata',
          metadata: { user: 'test', id: 123 },
          symbol: '◆',
          timestamp: new Date()
        },
        expectedMetadata: { user: 'test', id: 123 }
      },
      { 
        entry: {
          level: 'info',
          message: 'Test without metadata',
          symbol: '◆',
          timestamp: new Date()
        },
        expectedMetadata: {}
      }
    ] as const;

    for (const { entry, expectedMetadata } of testCases) {
      await transport.log(entry);
      const lastLog = logs[logs.length - 1];
      assert.deepStrictEqual(lastLog.args[0], expectedMetadata);
    }
  });

  // Update the serializer test as well
  it('should use custom serializers', async () => {
    // Create an array to capture the serialized output
    const serializedOutput: any[] = [];
    
    // Create a custom transport for pino that captures the serialized output
    const transport = {
      write: (chunk: string) => {
        serializedOutput.push(JSON.parse(chunk));
      }
    };

    // Create Pino instance with the custom transport
    const mockPino = pino({
      level: 'trace',
      serializers: {
        user: (user: any) => ({ id: user.id, type: 'user' })
      }
    }, transport);

    const pinoTransport = new PinoTransport({
      instance: mockPino
    });

    const entry: LogEntry = {
      level: 'info',
      message: 'Test serializer',
      metadata: {
        user: { id: 123, name: 'Test User', password: 'secret' }
      },
      symbol: '◆',
      timestamp: new Date()
    };

    await pinoTransport.log(entry);
    
    // Get the last log entry and check its serialized user property
    const lastLog = serializedOutput[serializedOutput.length - 1];
    assert.deepStrictEqual(lastLog.user, { id: 123, type: 'user' });
  });
});