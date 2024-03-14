import { ChatNickname } from 'src/nicknames/entities/nickname.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { ChatLog } from './chat-log.entity'
import { Report } from 'src/chattings/entities/report.entity'
import { ChatMessage } from 'src/messages/entities/message.entity'

@Entity({ name: 'chat_room' })
export class ChatRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  departureTime: string

  @Column({ nullable: false })
  departurePoint: string

  @Column({ nullable: false })
  arrivalPoint: string

  @Column({ default: true })
  isLive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => ChatNickname, (nickname) => nickname.rooms)
  nickname: ChatNickname

  @OneToMany(() => ChatLog, (chatLogs) => chatLogs.room)
  chatLogs: ChatLog[]

  @OneToMany(() => Report, (reports) => reports.room)
  reports: Report[]

  @OneToMany(() => ChatMessage, (messages) => messages.room)
  messages: ChatMessage[]
}
