import { Permissions } from '@lib/core';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import { CollectionEntity } from './collection.entity';
import { CollectionService } from './collection.service';

@Permissions('change_profile')
@ApiTags('collections')
@Crud({
  model: {
    type: CollectionEntity,
  }
})
@Controller('/collections')
export class CollectionController implements CrudController<CollectionEntity> {
  constructor(public service: CollectionService) {}
}
