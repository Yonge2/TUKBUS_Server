import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'chattingRoom' })
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  startTime: string

  @Column({ nullable: false })
  startPoint: string

  @Column({ nullable: false })
  arrivalPoint: string

  @Column({ default: true })
  isLive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updateddAt: Date

  //join
  @Column()
  hostId: string
}
