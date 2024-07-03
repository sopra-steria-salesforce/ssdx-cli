import { pino } from 'pino';

const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '_');

export const logger = pino({
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: {
    targets: [
      {
        target: 'pino/file',
        level: 'info',
        options: {
          destination: `.ssdx/logs/${currentDate}.log`,
          mkdir: true,
        },
      },
    ],
  },
});

export const loggerInfo = logger.info.bind(logger);
export const loggerError = logger.error.bind(logger);
