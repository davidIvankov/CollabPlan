import config from '@server/config'
import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
})

transporter
  .verify()
  .then(() => {
    console.log('SMTP transporter is ready')
  })
  .catch(console.error)
