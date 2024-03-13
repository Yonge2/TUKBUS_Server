import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { NicknamesService } from './nicknames.service'
import { BringUserDto } from './dto/bring-user.dto'
import { CreateNicknameDto } from './dto/create-nickname.dto'

@Controller('nicknames')
export class NicknamesController {
  constructor(private readonly nicknamesService: NicknamesService) {}

  //관리자만, 닉네임 요소 삽입할 수 있음
  @Post()
  createNicknameElement(@Body() createNicknameDto: CreateNicknameDto) {}

  //유저 정보 불러오고, 만들기(auth-server에서 유저 생성시 자동으로 요청)
  @Post()
  makeNickname(@Body() bringUserDto: BringUserDto) {
    return this.nicknamesService.makeNickname(bringUserDto)
  }
}
