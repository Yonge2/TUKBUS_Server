import { Module } from '@nestjs/common';
import { ChattingsService } from './chattings.service';
import { ChattingsController } from './chattings.controller';

@Module({
  controllers: [ChattingsController],
  providers: [ChattingsService],
})
export class ChattingsModule {}
