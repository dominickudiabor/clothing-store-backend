import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { ForbiddenError } from '../helpers/apiError'
import { JWT_SECRET } from '../util/secrets'
import Users from '../models/Users'

export default async function authJwt(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers['authorization']?.replace('Bearer ', '') || ''

    const decoded = jwt.verify(token, JWT_SECRET) as { email: string }

    const user = await Users.findOne({ email: decoded.email })

    /*     if(!user?.emailConfirmed){throw new ForbiddenError()} */

    req.user = user as {}
    next()
  } catch (error) {
    return next(new ForbiddenError())
  }
}
