import { ScmModule } from '@lib/scm';
import { TenantModule } from '@lib/tenant';
import { WebsiteModule } from '@lib/website';
import { Module } from '@nestjs/common';
import { EngineController } from './engine.controller';
import { EngineService } from './engine.service';

@Module({
  imports: [WebsiteModule, TenantModule, ScmModule],
  providers: [EngineService],
  exports: [EngineService],
  controllers: [EngineController],
})
export class EngineModule {}
