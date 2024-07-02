import { pino } from 'pino';
import moment from 'moment';

const cwd = process.cwd();
const currentDate = moment().format('YYYY_MM_DD');

// TODO: post errors to output
export const logger = pino(
  {
    level: process.env.PINO_LOG_LEVEL || 'info',
    formatters: {
      level: label => {
        return { level: label.toUpperCase() };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.destination(`${cwd}/.ssdx/logs/${currentDate}.log`)
);
