import { Inject, Injectable } from '@nestjs/common';
import { StorageService } from './storage.service';
import * as AWS from 'aws-sdk';
import { IAWSConfig } from './aws-config.interface';
import { S3 } from 'aws-sdk';
import { STORAGE_CONFIG_TOKEN } from './const';
import { Stream } from 'stream';
import { PutObjectRequest } from 'aws-sdk/clients/s3';

@Injectable()
export class AWSStorageService extends StorageService {
  private readonly s3: S3;

  constructor(@Inject(STORAGE_CONFIG_TOKEN) private options: IAWSConfig) {
    super();

    AWS.config.update({
      accessKeyId: this.options.accessKeyId,
      secretAccessKey: this.options.secretAccessKey,
      region: this.options.region,
    });
    this.s3 = new AWS.S3();
  }

  async delete(bucket: string, path: string): Promise<any> {
    const params = {
      Bucket: bucket,
      Key: path,
    };
    return this.s3.deleteObject(params).promise();
  }

  async upload(path: string, stream: Stream, options: { bucket: string }) {
    const params = {
      Bucket: options.bucket,
      Key: path,
      Body: stream,
    } as PutObjectRequest;

    await this.s3
      .upload(params, (err, data) => {
        if (err) {
          return err;
        }
        return data;
      })
      .promise();

    return true;
  }

  async checkExisted(path: string) {
    throw new Error('Not implement');
    return false;
  }

  async getMetadata(path: string) {
    throw new Error('Not implement');
  }

  async download(path: string) {
    throw new Error('Not implement');
    return false;
  }
}
