import { Test, TestingModule } from '@nestjs/testing';
import { ChattingsService } from './chattings.service';

describe('ChattingsService', () => {
  let service: ChattingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChattingsService],
    }).compile();

    service = module.get<ChattingsService>(ChattingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
