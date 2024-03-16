import { Controller, Get, Post, Body, Delete, Patch, Param, HttpCode } from '@nestjs/common'
import { ChattingsService } from './chattings.service'
import { BlockDto } from './dto/block.dto'
import { GetUser, ReqUser } from 'src/Authorization/Authorization.decorator'
import { ReportDto } from './dto/report.dto'

@Controller('api/chat/chattings')
export class ChattingsController {
  constructor(private readonly chattingsService: ChattingsService) {}
  //차단
  @Post('/blocks')
  addBlockUser(@GetUser() user: ReqUser, @Body() blockDto: BlockDto) {
    return this.chattingsService.addBlockUser(user, blockDto)
  }
  //사용자 차단목록
  @Get('/blocks')
  getBlockUsers(@GetUser() user: ReqUser) {
    return this.chattingsService.getBlockUsers(user)
  }
  //차단 취소
  @HttpCode(204)
  @Delete('/blocks/:blockidx')
  deleteBlockUser(@GetUser() user: ReqUser, @Param('blockidx') blockIdx: string) {
    return this.chattingsService.deleteBlockUser(user, Number(blockIdx))
  }
  //신고
  @Post('/reports')
  createReport(@GetUser() user: ReqUser, @Body() reportDto: ReportDto) {
    return this.chattingsService.createReport(user, reportDto)
  }

  //신고목록(관리자)
  @Get()
  getReportList(@GetUser() user: ReqUser) {}

  //신고(관리자)
  @Get()
  getReport(@GetUser() user: ReqUser) {}
}
