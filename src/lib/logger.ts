type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  [key: string]: unknown;
}

function formatEntry(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  if (process.env.NODE_ENV === 'development') {
    const { timestamp, ...rest } = entry;
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${Object.keys(rest).length > 2 ? JSON.stringify(rest) : ''}`;
  }

  return JSON.stringify(entry);
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(formatEntry('debug', message, meta));
    }
  },

  info(message: string, meta?: Record<string, unknown>) {
    console.info(formatEntry('info', message, meta));
  },

  warn(message: string, meta?: Record<string, unknown>) {
    console.warn(formatEntry('warn', message, meta));
  },

  error(message: string, meta?: Record<string, unknown>) {
    console.error(formatEntry('error', message, meta));
  },
};
