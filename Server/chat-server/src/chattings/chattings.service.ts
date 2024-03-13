import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ChattingsRepository } from './chattings.repository'
import { ReqUser } from 'src/Authorization/Authorization.decorator'
import { BlockDto } from './dto/block.dto'
import { Block } from './entities/block.entity'
import { ChatNickname } from 'src/nicknames/entities/nickname.entity'
import { ReportDto } from './dto/report.dto'
import { Report } from './entities/report.entity'

@Injectable()
export class ChattingsService {
  constructor(private chattingsRepository: ChattingsRepository) {}

  async addBlockUser(user: ReqUser, blockDto: BlockDto) {
    const blockObject = {
      nickname: {
        nickname: user.id,
        ...new ChatNickname(),
      },
      ...blockDto,
      ...new Block(),
    }
    const insertBlockUserResult = await this.chattingsRepository.insertBlockUser(blockObject)
    if (!insertBlockUserResult) {
      throw new HttpException('유저 차단 실패', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return {
      success: true,
      message: `${blockDto.blcokedUser}님 차단 완료`,
    }
  }

  async getBlockUsers(user: ReqUser) {
    const blockUsers = await this.chattingsRepository.getBlockUsers(user.id)
    if (!blockUsers.length) {
      return {
        success: true,
        data: [],
      }
    }
    return {
      success: true,
      data: blockUsers,
    }
  }

  async deleteBlockUser(user: ReqUser, blockedIdx: number) {
    const isDeletedBlockUser = await this.chattingsRepository.deleteBlockUser(user.id, blockedIdx)
    if (!isDeletedBlockUser) {
      throw new HttpException('유저 차단 삭제 실패', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return
  }

  async createReport(user: ReqUser, reportDto: ReportDto) {
    const reportObjet = {
      nickname: {
        nickname: user.id,
        ...new ChatNickname(),
      },
      ...reportDto,
      ...new Report(),
    }

    const isInsertedReport = await this.chattingsRepository.insertReport(reportObjet)
    if (!isInsertedReport) {
      throw new HttpException('유저 신고 실패', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return {
      success: true,
      message: `${reportDto.reportedUserNickname}님 신고 완료`,
    }
  }
}
