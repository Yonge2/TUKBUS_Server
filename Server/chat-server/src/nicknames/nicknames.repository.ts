import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ChatNickname } from './entities/nickname.entity'
import { NicknameElement } from './entities/nickname-element.entity'

@Injectable()
export class NicknameRepository {
  constructor(private dataSource: DataSource) {}

  async getNicknameElement(elementIdx: number, wordLocation: number) {
    return await this.dataSource.manager.findOne(NicknameElement, {
      select: ['element'],
      where: {
        elementIdx,
        wordLocation,
      },
    })
  }

  async insertNickname(chatNickname: ChatNickname) {
    try {
      const insertNicknameResult = await this.dataSource.manager.insert(ChatNickname, chatNickname)
      return true
    } catch (err) {
      console.log('insert nickname err : ', err)
      return false
    }
  }
}
