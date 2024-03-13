import { ChatNickname } from 'src/nicknames/entities/nickname.entity'
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'block' })
export class Block {
  @PrimaryGeneratedColumn()
  blockIdx: number

  @Column({ nullable: false })
  blcokedUser: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updateddAt: Date

  @ManyToOne(() => ChatNickname, (nickname) => nickname.blocks)
  nickname: ChatNickname
}
