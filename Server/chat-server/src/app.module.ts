import { Module } from '@nestjs/common'
import { ChattingsModule } from './chattings/chattings.module'
import { RoomsModule } from './rooms/rooms.module';

@Module({
  imports: [ChattingsModule, RoomsModule],
})
export class AppModule {}
