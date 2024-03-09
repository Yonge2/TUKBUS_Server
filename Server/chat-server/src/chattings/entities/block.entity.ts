import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

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

  //join
  @Column()
  userId: string
}
