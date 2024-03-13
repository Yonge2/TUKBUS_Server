import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { Block } from './entities/block.entity'
import { Report } from './entities/report.entity'

@Injectable()
export class ChattingsRepository {
  constructor(private dataSource: DataSource) {}

  async insertBlockUser(block: Block) {
    try {
      const insertBlockJob = await this.dataSource.manager.insert(Block, block)
      return true
    } catch (err) {
      console.log('insert block err : ', err)
      return false
    }
  }

  async getBlockUsers(nickname: string) {
    return await this.dataSource.manager.find(Block, {
      select: ['blockIdx', 'blcokedUser'],
      where: { nickname: { nickname } },
    })
  }

  async deleteBlockUser(nickname: string, blockedIdx: number) {
    try {
      const updateBlockUserJob = await this.dataSource.manager.delete(Block, { nickname: { nickname }, blockedIdx })
      console.log(updateBlockUserJob)

      return true
    } catch (err) {
      console.log('update out ChatLog err : ', err)
      return false
    }
  }

  async insertReport(report: Report) {
    try {
      const insertReportJob = await this.dataSource.manager.insert(Report, report)
      return true
    } catch (err) {
      console.log('insert block err : ', err)
      return false
    }
  }

  async getReports() {}
}
