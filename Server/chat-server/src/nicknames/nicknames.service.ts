import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { BringUserDto } from './dto/bring-user.dto'
import { NicknamesUtil } from './nicknames.util'
import { ChatNickname } from './entities/nickname.entity'
import { NicknameRepository } from './nicknames.repository'

@Injectable()
export class NicknamesService {
  constructor(
    private nicknameUtil: NicknamesUtil,
    private nicknameRepository: NicknameRepository,
  ) {}

  async makeNickname(bringUserDto: BringUserDto) {
    //유저 아이디 받기
    const nicknameObject = {
      userId: bringUserDto.userId,
      univName: bringUserDto.univName,
      nickname: '',
      ...new ChatNickname(),
    }
    //랜덤 닉네임 생성하기
    const randomPickArray = this.nicknameUtil.randomPicker()
    const makeNicknameJob = randomPickArray.map(async (elementIdx, wordLocation) => {
      wordLocation += 1
      elementIdx += (wordLocation - 1) * 10
      const nicknameElement = await this.nicknameRepository.getNicknameElement(elementIdx, wordLocation)
      nicknameObject.nickname += nicknameElement.element
    })
    await Promise.all(makeNicknameJob)

    const isInsertSuccess = await this.nicknameRepository.insertNickname(nicknameObject)
    if (!isInsertSuccess) {
      throw new HttpException('삽입 실패, 재시도 요망', HttpStatus.CONFLICT)
    }
    return {
      success: true,
    }
  }

  async getNickname(ip: string, userId: string) {
    if (ip != '::1') {
      throw new HttpException('올바르지 못한 접근', HttpStatus.FORBIDDEN)
    }
    return await this.nicknameRepository.getNicknameByUserId(userId)
  }
}
