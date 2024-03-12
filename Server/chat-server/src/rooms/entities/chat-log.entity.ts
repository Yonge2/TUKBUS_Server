import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { ChatRoom } from './room.entity'
import { ChatNickname } from 'src/nicknames/entities/nickname.entity'

@Entity({ name: 'chat_log' })
export class ChatLog extends BaseEntity {
  @PrimaryGeneratedColumn()
  chatLogIdx: number

  // random 사용자의 첫 메시지 시점 분간을 위한 기록
  @Column({ nullable: false })
  firstMsgIdx: number

  @Column({ default: true })
  isIn: boolean

  @CreateDateColumn()
  createdAt: Date

  //isIn : ture -> false update 시, 작동, 즉, createdAt != updatedAt => 채팅방 나간 시간
  @UpdateDateColumn()
  updateddAt: Date

  @ManyToOne(() => ChatRoom, (room) => room.chatLogs)
  room: ChatRoom

  @ManyToOne(() => ChatNickname, (nickname) => nickname.chatLogs)
  nickname: ChatNickname
}
