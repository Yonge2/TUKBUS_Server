import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ChattingsModule } from './chattings/chattings.module'
import { RoomsModule } from './rooms/rooms.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { typeOrmConfig } from './config/typeorm.config'
import { AuthMiddleware } from './Authorization/Authorization.middleware'
import { RoomsController } from './rooms/rooms.controller'
import { HttpModule } from '@nestjs/axios'
import { NicknamesModule } from './nicknames/nicknames.module'
import { ChattingsController } from './chattings/chattings.controller'

@Module({
  imports: [
    ChattingsModule,
    RoomsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.MODE === 'production' ? '.production.env' : '.development.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => await typeOrmConfig(configService),
    }),
    HttpModule,
    NicknamesModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(RoomsController, ChattingsController)
  }
}
