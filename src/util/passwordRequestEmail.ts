import * as nodemailer from 'nodemailer'
import { USERNAME, PASSWORD } from './secrets'

interface Options {
  [key: string]: string;
}

const emailRequest = async function (options: Options) {
  const transporter: nodemailer.Transporter = nodemailer.createTransport({
    port: 25,
    secure: false,
    logger: true,
    debug: true,
    ignoreTLS: true, // add this
    service: 'GMAIL',
    auth: {
      user: USERNAME,
      pass: PASSWORD,
    },
  })
  return await transporter.sendMail({
    subject: options.subject,
    text: options.message,
    html: '',
    from: `${process.env.SMTP_NAME}/3000`,
    to: options.email,
  })
}

export default emailRequest
