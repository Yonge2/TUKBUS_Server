import { Injectable } from '@nestjs/common'

@Injectable()
export class NicknamesUtil {
  //10미만의 랜덤한 숫자
  private LIMIT_NUMBER = 10
  private DIGIT = 2
  private NEENED_NUMBER = 3

  randomPicker() {
    let randomNumberArray: number[] = []
    for (let i = 0; i < this.NEENED_NUMBER; i++) {
      const baseNumber = Math.floor(Math.random() * Math.pow(10, this.DIGIT))
      randomNumberArray.push(baseNumber % this.LIMIT_NUMBER)
    }

    return randomNumberArray
  }
}
