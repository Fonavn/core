import { Module } from '@nestjs/common';
import { FacebookController } from './facebook.controller';
import { FacebookService } from './facebook.service';

// This is tenant module (tenant's customers)
// Feature
//  - Set menu
//  - Web
//    - White listing web
@Module({
  providers: [FacebookService],
  exports: [FacebookService],
  controllers: [FacebookController],
})
export class FacebookModule {
  // APP_ID=<VALUE>
  // APP_SECRET=<VALUE>
  // APP_URL=<VALUE>
  // PAGE_ID=<VALUE>
  // PAGE_ACCESS_TOKEN=<VALUE>
  // VERIFY_TOKEN=<RANDOM-STRING>
  async registerRoot() {
    // empty
  }
}
