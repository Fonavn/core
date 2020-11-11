import { Injectable } from '@nestjs/common';
import { Stream } from 'stream';

export abstract class StorageService {
  abstract async upload(
    path: string,
    stream: Stream,
    options: any,
  ): Promise<boolean>;
  abstract async download(path: string): Promise<boolean>;
  abstract async checkExisted(path: string): Promise<boolean>;
  abstract async getMetadata(path: string): Promise<any>;
  abstract async delete(bucket: string, path: string): Promise<boolean>;
}
