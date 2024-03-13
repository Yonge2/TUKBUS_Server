import { IsString } from 'class-validator'

export class EnterRoomDto {
  @IsString()
  roomId: string
}
