import { Injectable } from '@nestjs/common'
import { ChatRoom } from './entities/room.entity'
import { DataSource } from 'typeorm'
import { ChatLog } from './entities/chat-log.entity'
import { ChatNickname } from 'src/nicknames/entities/nickname.entity'
import { ChatMessage } from 'src/messages/entities/message.entity'
import { query } from 'express'

@Injectable()
export class RoomsRepository {
  private readonly INIT_CHAT_INDEX = 0

  constructor(private dataSource: DataSource) {}

  async createRoomTransaction(chatRoom: ChatRoom) {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()

    await queryRunner.startTransaction()
    try {
      const insertRoomJob = await queryRunner.manager.save(ChatRoom, chatRoom)
      console.log('insert room : ', insertRoomJob)
      const roomId = insertRoomJob.id
      const newChatLogObject: ChatLog = {
        firstMsgIdx: this.INIT_CHAT_INDEX,
        ...new ChatLog(),
        nickname: insertRoomJob.nickname,
        room: {
          id: roomId,
          ...new ChatRoom(),
        },
      }
      const insertChatLogJob = await queryRunner.manager.insert(ChatLog, newChatLogObject)
      await queryRunner.commitTransaction()
      return roomId
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
        .select([
          'room.id AS roomId',
          'room.departureTime AS departureTime',
          'room.departurePoint AS departurePoint',
          'room.arrivalPoint AS arrivalPoint',
          `DATE_FORMAT(room.created_at, '%m-%d %H:%i') AS createTime`,
        ])
        .innerJoin('room.nickname', 'chat_nickname', 'chat_nickname.univ_name = :univName', { univName })
        .where('room.is_live = :isLive', { isLive: true })

      if (roomId) {
        baseQuery.andWhere('room.id = :roomId', { roomId })
        const myRoom = await baseQuery.getRawOne()
        return myRoom
      }

      const roomList = await baseQuery.getRawMany()
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
      .where('chatLog.nickname_nickname = :nickname', { nickname })
      .andWhere('chatLog.is_in = :isIn', { isIn: true })
      .getRawOne()
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
        .set({ isIn: false })
        .where('nickname_nickname = :nickname', { nickname: nickname })
        .andWhere('room_id = :roomId', { roomId: roomId })
        .andWhere('is_in = :isIn', { isIn: true })
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
