import * as dotenv from 'dotenv';
import fs from 'fs';
import { resolve } from 'path';

dotenv.config({
  path: process.env.NODE_ENV === undefined ? '/s3client/.env' : '.env',
});

let config;
let configpath;

if (process.env.NODE_ENV?.trim() === 'development') {
  config = JSON.parse(fs.readFileSync(resolve(__dirname, 's3client.config.json'), 'utf-8'));
  configpath = resolve(__dirname, 's3client.config.json');
}

if (process.env.NODE_ENV === 'production') {
  config = JSON.parse(fs.readFileSync(resolve('/s3client/config/s3client.config.json'), 'utf-8'));
  configpath = resolve('/s3client/config/s3client.config.json');
}

export { config, configpath };
