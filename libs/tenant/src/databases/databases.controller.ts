import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import { Roles } from '../decorators/roles.decorator';
import { DatabaseEntity } from './databases.entity';
import { DatabaseService } from './databases.service';

@ApiTags('databases')
@ApiBearerAuth()
@Roles('isSuperuser')
@Crud({
  model: {
    type: DatabaseEntity,
  },
})
@Controller('/admin/databases')
export class DatabaseController implements CrudController<DatabaseEntity> {
  constructor(public service: DatabaseService) {}
}
