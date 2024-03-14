import { Module } from '@nestjs/common'
import { RoomsService } from './rooms.service'
import { RoomsController } from './rooms.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RoomsRepository } from './rooms.repository'
import { RedisModule } from 'src/redis/redis.module'
// import { ChattingRoom } from './entities/room.entity'

@Module({
  imports: [RedisModule],
  controllers: [RoomsController],
  providers: [RoomsService, RoomsRepository],
})
export class RoomsModule {}
