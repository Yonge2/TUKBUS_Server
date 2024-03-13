import { IsNumber, IsString } from 'class-validator'

export class CreateNicknameDto {
  @IsString()
  elemanet: string

  @IsNumber()
  wordLocation: number
}
