type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  context: string;
  action: string;
  details?: Record<string, any>;
  error?: Error | unknown;
}

const formatLog = (level: LogLevel, data: LogContext): string => {
  const timestamp = new Date().toISOString();
  const { context, action, details, error } = data;

  let message = `[${timestamp}] [${level.toUpperCase()}] ${context} - ${action}`;

  if (details) {
    message += `\nDetails: ${JSON.stringify(details, null, 2)}`;
  }

  if (error) {
    if (error instanceof Error) {
      message += `\nError: ${error.message}\n${error.stack}`;
    } else {
      message += `\nError: ${JSON.stringify(error, null, 2)}`;
    }
  }

  return message;
};

export const logger = {
  info: (data: LogContext) => {
    console.log(formatLog('info', data));
  },

  warn: (data: LogContext) => {
    console.warn(formatLog('warn', data));
  },

  error: (data: LogContext) => {
    console.error(formatLog('error', data));
  },

  debug: (data: LogContext) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatLog('debug', data));
    }
  },
};