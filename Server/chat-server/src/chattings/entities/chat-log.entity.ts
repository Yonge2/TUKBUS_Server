import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'chat_log' })
export class ChatLog {
  @PrimaryGeneratedColumn()
  chatLogIdx: number

  // random 사용자의 첫 메시지 시점 분간을 위한 기록
  @Column({ nullable: false })
  firstMsgIdx: number

  @Column({ nullable: false, default: true })
  isIn: boolean

  @CreateDateColumn()
  createdAt: Date

  //isIn : ture -> false update 시, 작동, 즉, createdAt != updatedAt => 채팅방 나간 시간
  @UpdateDateColumn()
  updateddAt: Date

  //join
  @Column()
  roomId: string

  @Column()
  userId: string

  @Column()
  nickname: string
}
