import appRoot from 'app-root-path';
import { format } from 'winston';

const pathLog = '/s3client';

export const options = {
  fileaccess: {
    level: 'info',
    filename: `${pathLog}/logs/access.log`,
    handleExceptions: true,
    format: format.printf((info) => `${[info.timestamp]} - ${info.message}`),
    colorize: true,
    exitOnError: true,
  },
  filebusiness: {
    level: 'info',
    filename: `${pathLog}/logs/business.log`,
    handleExceptions: true,
    format: format.printf((info) => `${[info.timestamp]} - ${info.message}`),
    colorize: true,
    exitOnError: false,
  },
  fileerror: {
    level: 'error',
    filename: `${pathLog}/logs/errors.log`,
    handleExceptions: true,
    format: format.printf((error) => `${[error.timestamp]} - ${error.message}`),
    colorize: true,
    exitOnError: false,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    format: format.printf((debug) => `${debug.level}: ${[debug.timestamp]} - ${debug.message}`),
    json: true,
    colorize: true,
    exitOnError: false,
  },
};
