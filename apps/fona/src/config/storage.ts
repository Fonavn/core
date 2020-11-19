import { IAWSConfig } from "@lib/storage/aws-config.interface";
import { IStorageConfig } from "@lib/storage/storage-config.interface";

export default () => {
  const config = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  } as IAWSConfig;

  return Object.freeze({ storage: config });
};
