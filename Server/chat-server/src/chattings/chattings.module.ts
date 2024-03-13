import { Module } from '@nestjs/common'
import { ChattingsService } from './chattings.service'
import { ChattingsController } from './chattings.controller'
import { ChattingsRepository } from './chattings.repository'

@Module({
  controllers: [ChattingsController],
  providers: [ChattingsService, ChattingsRepository],
})
export class ChattingsModule {}
