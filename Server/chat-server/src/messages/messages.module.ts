import { Module } from '@nestjs/common'
import { MessagesService } from './messages.service'
import { MessagesController } from './messages.controller'
import { MessagesRepository } from './messages.repository'
import { RedisModule } from 'src/redis/redis.module'

@Module({
  imports: [RedisModule],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesRepository],
})
export class MessagesModule {}
