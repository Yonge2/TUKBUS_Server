import { IsString } from 'class-validator'

export class CreateRoomDto {
  @IsString()
  startTime: string

  @IsString()
  startPoint: string

  @IsString()
  arrivalPoint: string
}
