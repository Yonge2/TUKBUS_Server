import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { AuthMiddleware } from './Authorization.middleware'

@Module({
  imports: [HttpModule],
  providers: [AuthMiddleware],
})
export class CatsModule {}
