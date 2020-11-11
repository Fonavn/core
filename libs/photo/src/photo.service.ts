import { Inject, Type } from '@nestjs/common';
import {
  DeepPartial,
  EntityManager,
  Transaction,
  TransactionManager,
} from 'typeorm';
import { PhotoEntity } from './photos.entity';
import { PHOTO_BUCKET_TOKEN } from './const';
import { Stream } from 'stream';
import { STORAGE_SERVICE_TOKEN } from '@lib/storage/const';
import { StorageService } from '@lib/storage';

export interface IPhotoService<T> {
  create(
    createDTO: DeepPartial<T>,
    metaData: { suffix: string },
    stream: Stream,
  ): Promise<any>;
  delete(id: string): Promise<any>;
}

export function PhotoService<T extends PhotoEntity>(
  Repo: Type<T>,
): Type<IPhotoService<any>> {
  class PhotoServiceHost {
    constructor(
      @Inject(STORAGE_SERVICE_TOKEN) private storageService: StorageService,
      @Inject(PHOTO_BUCKET_TOKEN) private bucket: string,
    ) {}

    @Transaction()
    async create(
      createDTO: DeepPartial<T>,
      metaData: { suffix: string },
      stream: Stream,
      @TransactionManager() manager?: EntityManager,
    ) {
      const photo = await manager.save(
        manager
          .getRepository(Repo)
          .create({ ...createDTO, photoMimeType: metaData.suffix }),
      );
      return this.storageService.upload(
        `${photo.id}.${metaData.suffix}`,
        stream,
        { bucket: this.bucket },
      );
    }

    @Transaction()
    async delete(
      id: string,
      @TransactionManager() manager?: EntityManager,
    ): Promise<any> {
      // No need
      const entity: PhotoEntity = await manager
        .getRepository(Repo)
        .createQueryBuilder('ph')
        .where('ph.photoId = :id', { id })
        .getOne();
      await manager.getRepository(Repo).delete(id);
      return this.storageService.delete(
        this.bucket,
        `${entity.id}.${entity.mimeType}`,
      );
    }

    // async abstract update(id, updateDTO: Partial<T>): Promise<boolean>;
  }

  return PhotoServiceHost;
}
