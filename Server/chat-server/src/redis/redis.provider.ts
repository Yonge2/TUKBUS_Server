import { createClient } from 'redis'
import * as dotenv from 'dotenv'
dotenv.config({
  path: process.env.MODE === 'production' ? '.production.env' : '.development.env',
})

export const redisProvider = [
  {
    provide: 'REDIS_CLIENT',
    useFactory: async () => {
      const client = createClient({
        url: process.env.REDIS_URL,
      })
      await client.connect()
      return client
    },
  },
]
