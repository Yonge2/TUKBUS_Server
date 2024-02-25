const express = require('express')
const PORT = require('../private/privatekey_Tuk').PORT

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/auth')

app.listen(PORT.AUTH_SERVER_PORT, '0.0.0.0', () => {
  console.log('aa-server has started')
})
