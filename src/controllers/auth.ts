import { Request, Response, NextFunction } from 'express'

import User from '../models/Users'

import { SENDGRID_API_KEY, FROM_EMAIL } from '../util/secrets'

import sgMail from '@sendgrid/mail'
import {
  BadRequestError,
  FailedRequestError,
  NotFoundError,
} from '../helpers/apiError'
import bcrypt from 'bcryptjs'

sgMail.setApiKey(SENDGRID_API_KEY)

//POST /password-request
export const requestReset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body
  const user = await User.findOne({ email })

  if (user) {
    await user.generatePasswordReset()
    try {
      await user.save()

      const link = `http://${req.headers.host}/api/v1/auth/password-reset/${user.resetPasswordToken}`

      const mailOptions = {
        to: user.email,
        from: FROM_EMAIL,
        subject: 'Password change request',
        html: `Hello ${user.firstname},<br><br>  Please click on the following <strong><a href=${link}>link</a></strong> to reset your password. <br><br> 
        If you did not request this, please ignore this email and your password will remain unchanged.
        `,
      }
      try {
        const sendMail = await sgMail.send(mailOptions)
        if (sendMail) {
          res.json({
            message: `A reset email has been sent to ${user.email} .`,
          })
        } else {
          next(new BadRequestError('Reset Email could not be sent'))
        }
      } catch (error) {
        next(new BadRequestError())
      }
    } catch (error) {
      next(new BadRequestError())
    }
  } else {
    next(
      new NotFoundError(
        `The email address, ${email} is not associated with any account.`
      )
    )
  }
}

//GET /password-reset
export const validateReset = async (req: Request, res: Response) => {
  const { token } = req.params

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    })
    if (user) {
      res.redirect(
        `http://localhost:3000/password/reset/${user.resetPasswordToken}`
      )
    } else {
      throw new FailedRequestError()
    }
  } catch (error) {
    res.send('Password reset token is invalid or has expired.')
  }
}

//POST /password-reset
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      throw new NotFoundError('Password reset token is invalid or has expired.')
    } else {
      const salt = bcrypt.genSaltSync(10)
      const hashed = await bcrypt.hashSync(req.body.password, salt)

      user.password = hashed
      user.resetPasswordToken = undefined
      user.resetPasswordExpires = undefined

      try {
        await user.save()
      } catch (error) {
        res.json({ error: error.message })
      }

      const mailOptions = {
        to: user.email,
        from: FROM_EMAIL,
        subject: 'Your password has been changed',
        html: `Hello ${user.firstname},<br><br>  This is a confirmation that the password for your account ${user.email} has just been changed.`,
      }
      try {
        await sgMail.send(mailOptions)
        res.json({ message: 'Log in with your new password' })
      } catch (error) {
        res.json({ error: error.message })
      }
    }
  } catch (error) {
    res.json({ error: error.message })
  }
}
