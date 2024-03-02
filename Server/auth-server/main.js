const express = require('express')
const authRouter = require('./auth/auth.router')
require('dotenv').config()

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/api/auth', authRouter)

app.listen(process.env.AUTH_SERVER_PORT, '0.0.0.0', () => {
  console.log('auth-server has started')
})
