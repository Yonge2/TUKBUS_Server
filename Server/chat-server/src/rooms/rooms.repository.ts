import { Injectable } from '@nestjs/common'
import { ChatRoom } from './entities/room.entity'
import { DataSource } from 'typeorm'
import { ChatLog } from './entities/chat-log.entity'
import { ChatNickname } from 'src/nicknames/entities/nickname.entity'
import { ChatMessage } from 'src/messages/entities/message.entity'

@Injectable()
export class RoomsRepository {
  private readonly INIT_CHAT_INDEX = 0

  constructor(private dataSource: DataSource) {}

  async createRoomTransaction(chatRoom: ChatRoom) {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()

    await queryRunner.startTransaction()
    try {
      const insertRoomJob = await queryRunner.manager.insert(ChatRoom, chatRoom)
      const insertRoomResult = insertRoomJob.generatedMaps[0]

      const newChatLogObject: ChatLog = {
        firstMsgIdx: this.INIT_CHAT_INDEX,
        ...new ChatLog(),
        nickname: {
          nickname: insertRoomResult.nickname,
          ...new ChatNickname(),
        },
        room: {
          id: insertRoomResult.roomId,
          ...new ChatRoom(),
        },
      }

      const insertChatLogJob = await queryRunner.manager.insert(ChatLog, newChatLogObject)
      await queryRunner.commitTransaction()

      return true
    } catch (err) {
      await queryRunner.rollbackTransaction()
      console.log('createRoomTransaction rollback : ', err)

      return false
    } finally {
      await queryRunner.release()
    }
  }

  async getChatRoomList(univName: string, roomId?: string) {
    try {
      const baseQuery = this.dataSource.manager
        .createQueryBuilder(ChatRoom, 'room')
        .select()
        .leftJoinAndSelect('room.nickname', 'host', 'host.univ_name = :univName', { univName })
        .where('room.is_live = :isLive', { isLive: true })

      if (roomId) {
        baseQuery.andWhere('room.room_id = :roomId', { roomId })
      }

      const roomList = await baseQuery.getMany()
      return roomList
    } catch (err) {
      console.log('get ChatRoomList err : ', err)
      return
    }
  }

  async getRoomIdInChatRoom(nickname: string) {
    return await this.dataSource.manager
      .createQueryBuilder(ChatLog, 'chatLog')
      .select('chatLog.room_id', 'roomId')
      .where('chatLog.nickname = :nickname', { nickname })
      .andWhere('chatLog.is_in = :isIn', { isIn: true })
      .getOne()
  }

  async getLastMsgIdx(roomId: string) {
    return await this.dataSource.manager
      .createQueryBuilder(ChatMessage, 'message')
      .select('message.msg_idx', 'lastMsgIdx')
      .where('message.room_id = :roomId', { roomId })
      .orderBy('message.msg_idx', 'DESC')
      .limit(1)
      .getRawOne()
  }

  async insertInChatLog(chatLog: ChatLog) {
    try {
      const insertChatLogJob = this.dataSource.manager.insert(ChatLog, chatLog)
      return true
    } catch (err) {
      console.log('insert In ChatLog err : ', err)
      return false
    }
  }

  async updateOutChatLog(nickname: string, roomId: string) {
    try {
      const updateChatLog = await this.dataSource
        .createQueryBuilder()
        .update(ChatLog)
        .set({ is_in: false })
        .where('nickname = :nickname', { nickname: nickname })
        .andWhere('room_id = :roomId', { roomId: roomId })
        .andWhere('is_in = :isIn', { inIn: true })
        .execute()

      if (!updateChatLog.affected) {
        throw new Error('변화된 값 없음')
      }

      return true
    } catch (err) {
      console.log('update out ChatLog err : ', err)
      return false
    }
  }
}
