import { Test, TestingModule } from '@nestjs/testing';
import { ScmService } from './scm.service';

describe('ScmService', () => {
  let service: ScmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScmService],
    }).compile();

    service = module.get<ScmService>(ScmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
