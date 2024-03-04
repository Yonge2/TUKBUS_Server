import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { RoomsService } from './rooms.service'
import { CreateRoomDto } from './dto/create-room.dto'

@Controller('api/chattings/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  //채팅방 개설
  @Post()
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto)
  }

  //채팅방 리스트
  @Get()
  findAll() {
    return this.roomsService.findAll()
  }
}
