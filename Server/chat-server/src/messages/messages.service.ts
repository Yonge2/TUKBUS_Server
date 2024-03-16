import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { SaveMessageDto } from './dto/save-message.dto'
import { ChatMessage } from './entities/message.entity'
import { ReqUser } from 'src/Authorization/Authorization.decorator'
import { ChatRoom } from 'src/rooms/entities/room.entity'
import { RedisClientType } from 'redis'
import { MessagesRepository } from './messages.repository'

@Injectable()
export class MessagesService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: RedisClientType,
    private readonly messagesRepository: MessagesRepository,
  ) {}

  private ROOM_MEMBER_IN_REDIS = (roomId: string) => `ROOM_MEMBER:${roomId}`

  async saveMessage(user: ReqUser, saveMessageDto: SaveMessageDto) {
    const roomId = saveMessageDto.roomId
    const sender = user.nickname

    const key = this.ROOM_MEMBER_IN_REDIS(roomId)
    const members = await this.redis.sMembers(key)
    const receiver = members.filter((member) => member != sender)

    const messageObjcet = {
      nickname: sender,
      receiver: receiver,
      message: saveMessageDto.message,
      room: {
        id: roomId,
        ...new ChatRoom(),
      },
      ...new ChatMessage(),
    }

    const saveMessageResult = await this.messagesRepository.insertMessage(messageObjcet)
    if (!saveMessageResult) {
      throw new HttpException('메시지 저장 실패', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return
  }

  async getPreMessages(user: ReqUser, roomId: string, page?: number) {
    page = page ? page : 0
    const messages = await this.messagesRepository.getMessages(roomId, user.nickname, page)
    return messages
  }
}
