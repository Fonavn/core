import { Module } from '@nestjs/common';
import { EngineController } from './engine.controller';
import { EngineService } from './engine.service';

@Module({
  providers: [EngineService],
  exports: [EngineService],
  controllers: [EngineController],
})
export class EngineModule {}
