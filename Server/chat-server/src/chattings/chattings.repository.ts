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
    return await this.dataSource.manager
      .createQueryBuilder(Block, 'block')
      .select([
        'block.block_idx AS blockIdx',
        'block.blocked_user AS blockedUser',
        `DATE_FORMAT(block.created_at, '%m-%d') AS blockedDate`,
      ])
      .where('block.nickname_nickname = :nickname', { nickname })
      .getRawMany()
  }

  async deleteBlockUser(nickname: string, blockIdx: number) {
    try {
      const deleteBlockUserJob = await this.dataSource.manager
        .createQueryBuilder()
        .delete()
        .from(Block)
        .where('nickname_nickname = :nickname', { nickname })
        .andWhere('block_idx = :blockIdx', { blockIdx })
        .execute()

      if (!deleteBlockUserJob.affected) {
        throw new Error('삭제된 데이터 없음')
      }
      return true
    } catch (err) {
      console.log('delete block user err : ', err)
      return false
    }
  }

  async insertReport(report: Report) {
    try {
      const insertReportJob = await this.dataSource.manager.insert(Report, report)
      return true
    } catch (err) {
      console.log('insert report err : ', err)
      return false
    }
  }

  async getReports() {}
}
