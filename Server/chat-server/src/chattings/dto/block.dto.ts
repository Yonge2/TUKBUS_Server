import { IsString } from 'class-validator'

export class BlockDto {
  @IsString()
  blockedUser: string
}
