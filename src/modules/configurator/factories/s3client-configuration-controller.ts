import { S3ClientConfiguration } from '../services';

export const makeLoadS3ConfigurationController = (): S3ClientConfiguration => {
  return new S3ClientConfiguration();
};
