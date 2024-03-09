import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity({ name: 'chat_nickname' })
export class ChatNickname {
  @PrimaryColumn()
  userId: string

  @Column({ unique: true })
  nickname: string

  @Column({ nullable: false })
  univName: string
}
