import pino from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: isDevelopment ? 'debug' : 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname',
          messageFormat: '{msg}',
          levelFirst: true,
        },
      }
    : undefined,
  timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
  formatters: {
    level: label => {
      return { level: label.toUpperCase() };
    },
  },
  redact: {
    paths: ['*.password', '*.token', '*.key'],
    remove: true,
  },
});
