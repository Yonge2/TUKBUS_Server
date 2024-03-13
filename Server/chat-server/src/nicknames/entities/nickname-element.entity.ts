import { BaseEntity, Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm'

//Active Record 패턴
//service에서 쿼리가 들어간 코드를 숨기고 더 간단한 서비스로직을 구현하고 싶어서
@Entity({ name: 'nickname_element' })
export class NicknameElement {
  @PrimaryGeneratedColumn()
  elementIdx: number

  @Column({ unique: true })
  element: string

  //1~3까지 제한, 제약조건 걸기
  @Column({ nullable: false })
  wordLocation: number
}
