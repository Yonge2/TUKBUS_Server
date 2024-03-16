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
        nickname: user.nickname,
        ...new ChatNickname(),
      },
      blockedUser: blockDto.blockedUser,
      ...new Block(),
    }
    const insertBlockUserResult = await this.chattingsRepository.insertBlockUser(blockObject)
    if (!insertBlockUserResult) {
      throw new HttpException('유저 차단 실패', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return {
      success: true,
      message: `${blockDto.blockedUser}님 차단 완료`,
    }
  }

  async getBlockUsers(user: ReqUser) {
    const blockUsers = await this.chattingsRepository.getBlockUsers(user.nickname)
    if (!blockUsers.length) {
      return {
        success: true,
        message: '차단한 유저가 없습니다.',
      }
    }
    return blockUsers
  }

  async deleteBlockUser(user: ReqUser, blockIdx: number) {
    console.log(blockIdx)
    const isDeletedBlockUser = await this.chattingsRepository.deleteBlockUser(user.nickname, blockIdx)
    if (!isDeletedBlockUser) {
      throw new HttpException('유저 차단 삭제 실패', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return
  }

  async createReport(user: ReqUser, reportDto: ReportDto) {
    const reportObjet = {
      nickname: {
        nickname: user.nickname,
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
