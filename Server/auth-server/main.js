const express = require('express')
const PORT = require('../private/privatekey_Tuk').PORT
const authRouter = require('./auth/auth.router')

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/api/auth', authRouter)

app.listen(PORT.AUTH_SERVER_PORT, '0.0.0.0', () => {
  console.log('auth-server has started')
})
