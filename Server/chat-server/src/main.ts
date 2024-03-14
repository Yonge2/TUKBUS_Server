import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as dotenv from 'dotenv'
dotenv.config({
  path: process.env.MODE === 'production' ? '.production.env' : '.development.env',
})

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(process.env.CHAT_SERVER_PORT)
}
bootstrap()
