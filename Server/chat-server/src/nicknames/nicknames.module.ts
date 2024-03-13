import { Module } from '@nestjs/common'
import { NicknamesService } from './nicknames.service'
import { NicknamesController } from './nicknames.controller'
import { NicknamesUtil } from './nicknames.util'
import { NicknameRepository } from './nicknames.repository'

@Module({
  controllers: [NicknamesController],
  providers: [NicknamesService, NicknamesUtil, NicknameRepository],
})
export class NicknamesModule {}
