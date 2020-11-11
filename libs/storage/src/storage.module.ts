import { DynamicModule, Module } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { AWSStorageService } from './aws-storage.service';
import { STORAGE_SERVICE_TOKEN, STORAGE_CONFIG_TOKEN } from './const';
import { IAWSConfig } from './aws-config.interface';

@Module({})
export class StorageModule {
  static registerAsync(options: StorageConfigAsyncOptions): DynamicModule {
    return {
      module: StorageModule,
      providers: [
        AWSStorageService,
        {
          provide: STORAGE_SERVICE_TOKEN,
          useClass: AWSStorageService,
        },
        {
          provide: STORAGE_CONFIG_TOKEN,
          useFactory: options.useFactory,
          inject: options.inject,
        },
      ],
      exports: [AWSStorageService, STORAGE_SERVICE_TOKEN],
      global: true,
    };
  }
}

export interface StorageConfigAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<IAWSConfig>;
}
