import { Module } from '@nestjs/common'
import { RoomsService } from './rooms.service'
import { RoomsController } from './rooms.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RoomsRepository } from './rooms.repository'
// import { ChattingRoom } from './entities/room.entity'

@Module({
  // imports: [TypeOrmModule.forFeature([ChattingRoom])],
  controllers: [RoomsController],
  providers: [RoomsService, RoomsRepository],
})
export class RoomsModule {}
