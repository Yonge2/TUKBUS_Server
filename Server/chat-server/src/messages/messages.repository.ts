import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ChatMessage } from './entities/message.entity'

@Injectable()
export class MessagesRepository {
  constructor(private dataSource: DataSource) {}

  private readonly MESSAGE_LIMIT = 20

  async insertMessage(messageObject: ChatMessage) {
    try {
      const insertMessageJob = await this.dataSource.manager.insert(ChatMessage, messageObject)
      return true
    } catch (err) {
      console.log('insert message err : ', err)
      return false
    }
  }

  async getMessages(roomId: string, nickname: string, page: number) {
    return await this.dataSource.manager.query(
      `
        SELECT msg_idx AS msgIdx, message, DATE_FORMAT(time, '%H:%i') AS time
        FROM chat_message
        WHERE room_id = '${roomId}' 
        AND msg_idx >= (
            SELECT first_msg_idx
            FROM chat_log
            WHERE room_id='${roomId}' AND nickname='${nickname}' AND is_in=true
        )
        ORDER BY msg_idx desc
        OFFSET ${page * this.MESSAGE_LIMIT}
        LIMIT ${this.MESSAGE_LIMIT};
        `,
    )
  }
}
