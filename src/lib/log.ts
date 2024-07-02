import { pino } from 'pino';

const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '_');

// TODO: post errors to output
export const logger = pino({
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: {
    targets: [
      {
        target: 'pino/file',
        level: 'info',
        options: {
          destination: `.ssdx/logs/${currentDate}.info.log`,
          mkdir: true,
        },
      },
      {
        target: 'pino/file',
        level: 'error',
        options: {
          destination: `.ssdx/logs/${currentDate}.error.log`,
          mkdir: true,
        },
      },
    ],
  },
});

export const loggerInfo = logger.info.bind(logger);
export const loggerError = logger.error.bind(logger);
