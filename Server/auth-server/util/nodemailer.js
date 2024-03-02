const nodemailer = require('nodemailer')
require('dotenv').config()

const mailer = (mailObject) => {
  return new Promise((resolve, reject) => {
    const mailTransport = nodemailer.createTransport(mailObject.createMailObj)
    mailTransport.sendMail(mailObject.mailOptions, (err) => {
      if (err) return reject(err.message)
      return resolve()
    })
  })
}

const mailContent = async (authNum, userEmail) => {
  const title = '통학러 학교 인증'
  const content = `인증번호는 ${authNum} 입니다. \n인증번호는 10분 간 유효합니다.`
  return {
    createMailObj: {
      service: 'Gmail',
      auth: {
        user: process.env.NODE_MAIL_USER,
        pass: process.env.NODE_MAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    },
    mailOptions: {
      from: process.env.NODE_MAIL_USER,
      to: userEmail,
      subject: title,
      text: content,
    },
  }
}

module.exports = { mailer, mailContent }
