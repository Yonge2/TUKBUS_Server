import { ChatNickname } from 'src/nicknames/entities/nickname.entity'
import { ChatRoom } from 'src/rooms/entities/room.entity'
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'chat_message' })
export class ChatMessage {
  @PrimaryGeneratedColumn()
  msgIdx: number

  @Column('simple-array', { nullable: true })
  receiver: string[]

  @Column({ nullable: false })
  message: string

  @CreateDateColumn()
  time: Date

  @ManyToOne(() => ChatRoom, (room) => room.messages)
  room: ChatRoom

  @ManyToOne(() => ChatNickname, (nickname) => nickname.messages)
  nickname: ChatNickname
}
