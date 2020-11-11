import { StorageModule } from '@lib/storage';
import { DynamicModule, Module } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { PHOTO_BUCKET_TOKEN } from './const';
import { IPhotoConfig } from './photo-config.interface';

@Module({})
export class PhotoModule {
  static registerAsync(options: PhotoConfigAsyncOptions): DynamicModule {
    return {
      module: PhotoModule,
      imports: [StorageModule],
      providers: [
        {
          provide: PHOTO_BUCKET_TOKEN,
          useFactory: options.useFactory,
          inject: options.inject,
        },
      ],
      exports: [PHOTO_BUCKET_TOKEN],
      global: true,
    };
  }
}

export interface PhotoConfigAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<IPhotoConfig>;
}
