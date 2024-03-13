import { IsString } from 'class-validator'

export class BlockDto {
  @IsString()
  blcokedUser: string
}
