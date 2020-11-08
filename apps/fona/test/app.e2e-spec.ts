import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as faker from 'faker';

describe('AppController (e2e)', () => {
  let app;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200);
  });

  // TODO dont have solution yet
  it.skip('/random (GET)', () => {
    return request(app.getHttpServer())
      .get(`/${faker.random.word()}`)
      .expect(404);
  });

  afterEach(async () => {
    return app.close();
  });
});
