import { Controller, Get, Post, Body, Patch, Param, HttpCode } from '@nestjs/common'
import { RoomsService } from './rooms.service'
import { CreateRoomDto } from './dto/create-room.dto'
import { GetUser, ReqUser } from 'src/Authorization/Authorization.decorator'
import { EnterRoomDto } from './dto/enter-room.dto'

@Controller('api/chat/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  //채팅방 개설
  @Post()
  createChattingRoom(@GetUser() user: ReqUser, @Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.createChatRoom(user, createRoomDto)
  }
  //채팅방 리스트
  @Get()
  getChattingRooms(@GetUser() user: ReqUser) {
    return this.roomsService.getChattingRooms(user)
  }
  //채팅방 입장
  @Post('/in')
  inChatRoom(@GetUser() user: ReqUser, @Body() enterRoomDto: EnterRoomDto) {
    return this.roomsService.enterChatRoom(user, enterRoomDto)
  }
  //채팅방 퇴장
  @HttpCode(204)
  @Patch('/out')
  outChatRoom(@GetUser() user: ReqUser, @Body() enterRoomDto: EnterRoomDto) {
    return this.roomsService.outChatRoom(user, enterRoomDto)
  }
}
