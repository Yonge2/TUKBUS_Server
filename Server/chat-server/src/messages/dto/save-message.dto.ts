import { IsString } from 'class-validator'

export class SaveMessageDto {
  @IsString()
  roomId: string

  @IsString()
  message: string
}
