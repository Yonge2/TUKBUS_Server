import { Request, Response, NextFunction } from 'express'
import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private readonly AUTH_SERVER_URL = this.configService.get('AUTH_SERVER_URL')

  use = async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.headers.authorization

    if (!accessToken) {
      return res.status(401).json({ error: '토큰 없음' })
    }

    try {
      const { data } = await this.httpService.axiosRef.get(this.AUTH_SERVER_URL, {
        headers: {
          Authorization: accessToken,
        },
      })
      req['user'] = data.user
      return next()
    } catch (err) {
      throw new HttpException(err.response.data.message, HttpStatus.UNAUTHORIZED)
    }
  }
}
