import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import { Roles } from '../decorators/roles.decorator';
import { DatabaseEntity } from './databases.entity';
import { DatabaseService } from './databases.service';
import { InDatabaseDto } from './dto/in-database.dto';
import { InUpdateDatabaseDto } from './dto/in-update-database.dto';

@ApiTags('databases')
@ApiBearerAuth()
@Roles('isSuperuser')
@Crud({
  model: {
    type: DatabaseEntity,
  },
  dto: {
    create: InDatabaseDto,
    update: InUpdateDatabaseDto,
  },
})
@Controller('/admin/databases')
export class DatabaseController implements CrudController<DatabaseEntity> {
  constructor(public service: DatabaseService) {}
}
