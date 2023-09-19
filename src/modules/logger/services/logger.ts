import winston from 'winston';
import { options } from '../config';

const logConfigBusiness = {
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'DD/MM/YYYY HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.align(),
  ),
  transports: [new winston.transports.File(options.filebusiness)],
};

const logConfigAccess = {
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'DD/MM/YYYY HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.align(),
  ),
  transports: [new winston.transports.File(options.fileaccess)],
};

const logConfigError = {
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'DD/MM/YYYY HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.align(),
  ),
  transports: [new winston.transports.File(options.fileerror)],
};

const business = winston.createLogger(logConfigBusiness);
const access = winston.createLogger(logConfigAccess);
const errors = winston.createLogger(logConfigError);

if (process.env.NODE_ENV?.trim() === 'development') {
  business.add(new winston.transports.Console(options.console));
  access.add(new winston.transports.Console(options.console));
  errors.add(new winston.transports.Console(options.console));
}

export { business, access, errors };
