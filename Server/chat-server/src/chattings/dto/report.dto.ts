import { IsString } from 'class-validator'

export class ReportDto {
  @IsString()
  reportedUserNickname: string

  @IsString()
  reason: string

  @IsString()
  roomId: string
}
