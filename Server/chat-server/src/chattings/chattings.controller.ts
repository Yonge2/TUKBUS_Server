import { Controller, Get, Post, Body, Delete, Patch } from '@nestjs/common';
import { ChattingsService } from './chattings.service';

@Controller('chattings')
export class ChattingsController {
  constructor(private readonly chattingsService: ChattingsService) {}

  //차단
  @Post()
  createBlockUser(@Body()){}

  //사용자 차단목록
  @Get()
  getBlockUsers(){}

  //차단 취소
  @Delete()
  deleteBlockUser(){}

  //채팅방 입장시
  @Post()
  inChatLog(@Body()){}

  //채팅방 나갈시
  @Patch()
  outChatLog(){}

  //신고
  @Post()
  createReport(@Body()){}

  //신고목록(관리자)
  @Get()
  getReportList(){}

  //신고(관리자)
  @Get()
  getReport(){}

}
