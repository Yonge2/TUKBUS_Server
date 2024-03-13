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
      ...bringUserDto,
      ...new ChatNickname(),
    }
    //랜덤 닉네임 생성하기
    const randomPickArray = this.nicknameUtil.randomPicker()
    let nickname = ''

    for (const arrayIdx of randomPickArray) {
      const wordLocation = arrayIdx + 1
      const nicknameElement = await this.nicknameRepository.getNicknameElement(randomPickArray[arrayIdx], wordLocation)

      nickname += nicknameElement.element
    }
    //생성한 닉네임 삽입
    nicknameObject.nickname = nickname
    const isInsertSuccess = await this.nicknameRepository.insertNickname(nicknameObject)
    if (!isInsertSuccess) {
      throw new HttpException('삽입 실패, 재시도 요망', HttpStatus.CONFLICT)
    }
    return {
      success: true,
    }
  }
}
