import { ChatNickname } from 'src/nicknames/entities/nickname.entity'
import { ChatRoom } from 'src/rooms/entities/room.entity'
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'report' })
export class Report {
  @PrimaryGeneratedColumn()
  reportIdx: number

  @Column({ nullable: false })
  reportedUserNickname: string

  @Column('text', { nullable: false })
  reason: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updateddAt: Date

  @ManyToOne(() => ChatRoom, (room) => room.reports)
  room: ChatRoom

  @ManyToOne(() => ChatNickname, (nickname) => nickname.reports)
  nickname: ChatNickname
}
