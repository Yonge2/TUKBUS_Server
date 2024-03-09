import { Controller, Get, Post, Body } from '@nestjs/common'
import { RoomsService } from './rooms.service'
import { CreateRoomDto } from './dto/create-room.dto'
import { GetUser, ReqUser } from 'src/Authorization/Authorization.decorator'

@Controller('api/chattings/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  //채팅방 개설
  @Post()
  createChattingRoom(@GetUser() user: ReqUser, @Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.createChattingRoom(user, createRoomDto)
  }

  //채팅방 리스트
  @Get()
  getChattingRooms(@GetUser() user: ReqUser) {
    return this.roomsService.getChattingRooms(user)
  }
}
