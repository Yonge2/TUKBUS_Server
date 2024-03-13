import { IsString } from 'class-validator'

export class BringUserDto {
  @IsString()
  userId: string

  @IsString()
  univName: string
}
