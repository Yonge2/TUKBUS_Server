import { Block } from 'src/chattings/entities/block.entity'
import { Report } from 'src/chattings/entities/report.entity'
import { ChatLog } from 'src/rooms/entities/chat-log.entity'
import { ChatRoom } from 'src/rooms/entities/room.entity'
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm'

@Entity({ name: 'chat_nickname' })
export class ChatNickname {
  @PrimaryColumn()
  nickname: string

  @Column({ unique: true })
  userId: string

  @Column({ nullable: false })
  univName: string

  @OneToMany(() => ChatRoom, (chatRooms) => chatRooms.nickname)
  rooms: ChatRoom[]

  @OneToMany(() => ChatLog, (chatLogs) => chatLogs.nickname)
  chatLogs: ChatLog[]

  @OneToMany(() => Report, (reports) => reports.nickname)
  reports: Report[]

  @OneToMany(() => Block, (blocks) => blocks.nickname)
  blocks: Block[]
}
