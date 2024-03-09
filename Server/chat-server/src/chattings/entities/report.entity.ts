import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'report' })
export class Report {
  @PrimaryGeneratedColumn()
  reportIdx: number

  @Column({ nullable: false })
  reportedUser: number

  @Column('text', { nullable: false })
  reason: string

  @CreateDateColumn()
  createdAt: Date

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
