import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode } from '@nestjs/common'
import { MessagesService } from './messages.service'
import { SaveMessageDto } from './dto/save-message.dto'
import { GetUser, ReqUser } from 'src/Authorization/Authorization.decorator'

@Controller('api/chat/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  //message 전달 여부만 판단하기 위한 response
  @HttpCode(204)
  @Post()
  saveMessage(@GetUser() user: ReqUser, @Body() saveMessageDto: SaveMessageDto) {
    return this.messagesService.saveMessage(user, saveMessageDto)
  }

  @Get()
  getPreMessages(@GetUser() user: ReqUser, @Query('roomId') roomId: string, @Query('page') page?: string) {
    return this.messagesService.getPreMessages(user, roomId, +page)
  }
}
