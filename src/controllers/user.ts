import { Request, Response, NextFunction } from 'express'
import User from '../models/Users'
import UserService from '../services/user'
import {
  NotFoundError,
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
} from '../helpers/apiError'

import jwt from 'jsonwebtoken'
import { JWT_SECRET, ADMIN, STRIPE_SECRET_KEY } from '../util/secrets'
import bcrypt from 'bcryptjs'

import Stripe from 'stripe'
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2020-08-27' })

import { SENDGRID_API_KEY, FROM_EMAIL } from '../util/secrets'

import sgMail from '@sendgrid/mail'

import { streamUpload } from '../util/image'

sgMail.setApiKey(SENDGRID_API_KEY)

// POST / users
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { displayName, email, firstName, lastName, password } = req.body
    const salt = bcrypt.genSaltSync(10)
    const hashed = await bcrypt.hashSync(password, salt)

    const payload = {
      username: displayName,
      firstname: firstName,
      lastname: lastName,
      email,
      password: hashed,
    }

    const checkUser = await User.find({ email })

    if (checkUser.length === 0) {
      const user = new User(payload)

      const newUser = await UserService.create(user)

      return res.status(200).json({ user: newUser })
    }
    return next(new BadRequestError('Email already exists'))
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(new BadRequestError('Invalid Request', error))
    }
    return next(new InternalServerError('Validation Error', error))
  }
}

// PUT /users/:userId
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.body)
    const { user } = req.body
    const update = user
    const userId = req.params.userId
    const updatedUser = await UserService.update(userId, update)

    res.status(200).json(updatedUser)
  } catch (error) {
    next(new BadRequestError('Email already taken', error))
  }
}

// GET /users/:userId
export const findById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).json(await UserService.findById(req.params.userId))
  } catch (error) {
    next(new NotFoundError('User not found', error))
  }
}

//POST /google-authenticate
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.user as { email: string }

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' })

    res.status(200).json({ token: token, user: req.user })
  } catch (error) {
    next(new NotFoundError('User not found'))
  }
}

//GET /login
export const findExistingUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body
  const checkUser = await User.findOne({ email }).select('+password').exec()

  try {
    if (checkUser && !checkUser.isBanned) {
      const verified = await bcrypt.compareSync(
        req.body.password,
        checkUser.password
      )

      if (verified) {
        const { email } = req.body
        const verifiedUser = await User.findOne({ email })
        const token = await jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' })

        return res.status(200).json({ token: token, user: verifiedUser })
      }
      next(new UnauthorizedError('User unauthorized'))
    } else {
      next(new NotFoundError('User is banned'))
    }
  } catch (error) {
    next(new NotFoundError())
  }
}

//POST update-password/:userId
export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { oldPassword, newPassword } = req.body.data as {
      oldPassword: string
      newPassword: string
    }
    const user = await UserService.findById(req.params.userId)

    if (user) {
      const confirmUser = await bcrypt.compareSync(oldPassword, user.password)

      if (!confirmUser) {
        throw new UnauthorizedError()
      } else {
        const salt = await bcrypt.genSaltSync(10)
        const hashed = await bcrypt.hashSync(newPassword, salt)
        user.password = hashed

        try {
          await user.save()

          res.sendStatus(200)
        } catch (error) {
          throw new InternalServerError()
        }
      }
    } else {
      next(new NotFoundError())
    }
  } catch (error) {
    next(new UnauthorizedError())
  }
}

//POST verification/:adminId

export const verifyAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await UserService.findById(req.params.adminId)

    if (user.role === 'admin') {
      res.status(200).json({ message: 'Access granted' })
    } else {
      throw new NotFoundError()
    }
  } catch (error) {
    next(new UnauthorizedError('Unauthorized access', error))
  }
}

//PUT /admin/:userid ban user
export const banUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await UserService.findById(req.params.userId)

    if (user.email === ADMIN) {
      throw new Error('Unable to ban Admin')
    } else {
      if (user) {
        user.isBanned = !user.isBanned
        try {
          await user.save()
          const response = await UserService.findAll()
          res
            .status(200)
            .json({ data: response, message: 'Ban status updated' })
        } catch (error) {
          throw new InternalServerError()
        }
      } else {
        next(new NotFoundError())
      }
    }
  } catch (error) {
    next(new NotFoundError('Unable to ban user'))
  }
}

//POST /upload-photo
export const uploadPhoto = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const update = req.body
    const user = await UserService.findById(req.params.userId)
    if (!req.file)
      return res.status(200).json({ user, message: 'User has been updated' })

    const result = (await streamUpload(req)) as { url: string }

    user.photo = result.url
    const updatedUser = await user.save()

    if (!req.file)
      return res
        .status(200)
        .json({ updateUser, message: 'User has been updated' })

    res.status(200).json({ user: updatedUser })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// GET all users /:adminId
export const findAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = await UserService.findAll()
    if (response.length !== 0) {
      res.status(200).json(response)
    } else {
      throw new NotFoundError()
    }
  } catch (error) {
    next(new NotFoundError('User not found', error))
  }
}

// DELETE /eradicate/:adminId
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await UserService.findById(req.params.userId)

    if (user.email === ADMIN) {
      throw new Error('Unable to delete Admin')
    } else {
      await UserService.deleteUser(req.params.userId)
      const response = await UserService.findAll()
      res.status(200).json({ data: response, message: 'User deleted' })
    }
  } catch (error) {
    next(new NotFoundError('Unable to delete user', error))
  }
}

//POST  / users/confirm-email/:userId

export const confirmEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await UserService.findById(req.params.userId)
    if (!user) {
      throw new NotFoundError()
    }

    await user.generatePasswordReset()
    await user.save()

    const link = `http://${req.headers.host}/api/v1/users/verify-email/${user.resetPasswordToken}`

    const mailOptions = {
      to: user.email,
      from: FROM_EMAIL,
      subject: 'Confirm your email',
      html: `Hello ${user.firstname},<br><br>  Please click on the following <strong><a href=${link}>link</a></strong> to confirm your email address. <br><br> 
  Once you do, you'll be able to access features that require a valid email address.
  `,
    }

    try {
      const sendMail = await sgMail.send(mailOptions)
      if (sendMail) {
        res.status(200).json({
          message: `Email has been sent to ${user.email}`,
        })
      } else {
        next(new BadRequestError('Reset Email could not be sent'))
      }
    } catch (error) {
      next(new BadRequestError())
    }
  } catch (error) {
    next(new NotFoundError('User not found', error))
  }
}

//GET /verify-email/:token
export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.params

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    })
    if (!user) {
      throw new NotFoundError()
    }
    user.emailConfirmed = true
    try {
      await user.save()
      res.status(200).redirect('http://localhost:3000')
    } catch (error) {
      throw new InternalServerError()
    }
  } catch (error) {
    res.send('Email reset token is invalid or has expired.')
  }
}

//POST /processPayment
export const processPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await UserService.findById(req.params.userId)

    if (!user) {
      throw new NotFoundError()
    }

    const { token, amount } = req.body.data
    const body = { source: token.id, amount: amount, currency: 'eur' }

    await stripe.charges.create(body)

    res.status(200).json({ message: 'Payment Successful' })
  } catch (error) {
    res.status(500).json({ message: 'Payment Failed' })
  }
}
