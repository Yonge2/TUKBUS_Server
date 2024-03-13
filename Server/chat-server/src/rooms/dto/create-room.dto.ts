import { IsString } from 'class-validator'

export class CreateRoomDto {
  @IsString()
  departureTime: string

  @IsString()
  departurePoint: string

  @IsString()
  arrivalPoint: string
}
