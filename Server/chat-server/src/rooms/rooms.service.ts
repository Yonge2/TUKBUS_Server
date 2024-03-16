import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { CreateRoomDto } from './dto/create-room.dto'
import { ReqUser } from 'src/Authorization/Authorization.decorator'
import { ChatRoom } from './entities/room.entity'
import { RoomsRepository } from './rooms.repository'
import { ChatLog } from './entities/chat-log.entity'
import { ChatNickname } from 'src/nicknames/entities/nickname.entity'
import { EnterRoomDto } from './dto/enter-room.dto'
import { RedisClientType } from 'redis'

@Injectable()
export class RoomsService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: RedisClientType,
    private roomsRepository: RoomsRepository,
  ) {}

  private ROOM_MEMBER_IN_REDIS = (roomId: string) => `ROOM_MEMBER:${roomId}`

  async createChatRoom(user: ReqUser, createRoomDto: CreateRoomDto) {
    const newRoomObject: ChatRoom = {
      nickname: { nickname: user.nickname, ...new ChatNickname() },
      ...createRoomDto,
      ...new ChatRoom(),
    }

    const createChatRoomResult = await this.roomsRepository.createRoomTransaction(newRoomObject)
    if (!createChatRoomResult) {
      throw new HttpException('삽입 트랜잭션 실패, 재시도 요망.', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    const roomMemberKey = this.ROOM_MEMBER_IN_REDIS(createChatRoomResult)
    await this.redis.sAdd(roomMemberKey, user.nickname)

    return {
      success: true,
      message: `${user.nickname}님의 채팅방 생성 완료.`,
    }
  }

  async getChattingRooms(user: ReqUser) {
    //로그확인(채팅 참여중인가)
    try {
      const isInRoom = await this.roomsRepository.getRoomIdInChatRoom(user.nickname)
      //채팅중(참여중인 방 제공)
      if (isInRoom) {
        const myRoomId = isInRoom.roomId
        return await this.roomsRepository.getChatRoomList(user.univName, myRoomId)
      }

      //채팅중 아님(리스트 제공)
      const chatRooms = await this.roomsRepository.getChatRoomList(user.univName)

      if (!chatRooms.length) {
        return {
          success: true,
          message: '활성화 된 채팅방이 없음',
        }
      }
      return chatRooms
    } catch {}
  }

  async enterChatRoom(user: ReqUser, enterRoomDto: EnterRoomDto) {
    const roomId = enterRoomDto.roomId
    const lastMsgIdx = await this.roomsRepository.getLastMsgIdx(roomId)
    const enterChatRoomInfo: ChatLog = {
      nickname: {
        nickname: user.nickname,
        ...new ChatNickname(),
      },
      room: {
        id: roomId,
        ...new ChatRoom(),
      },
      firstMsgIdx: lastMsgIdx ? lastMsgIdx.lastMsgIdx : 0,
      ...new ChatLog(),
    }
    const isEnterRoom = await this.roomsRepository.insertInChatLog(enterChatRoomInfo)
    if (!isEnterRoom) {
      throw new HttpException('채팅방에 입장하지 못함', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    const roomMemberKey = this.ROOM_MEMBER_IN_REDIS(roomId)
    await this.redis.sAdd(roomMemberKey, user.nickname)
    return {
      success: true,
      message: `${user.nickname}님 ${enterRoomDto.roomId} 채팅방 입장`,
    }
  }

  async outChatRoom(user: ReqUser, enterRoomDto: EnterRoomDto) {
    const roomId = enterRoomDto.roomId
    const delMemberKey = this.ROOM_MEMBER_IN_REDIS(roomId)
    const isOutRedis = await this.redis.sRem(delMemberKey, user.nickname)

    const isOutRoom = await this.roomsRepository.updateOutChatLog(user.nickname, roomId)
    if (!isOutRoom || !isOutRedis) {
      throw new HttpException('채팅방 퇴장 오류', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return
  }
}
