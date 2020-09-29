import User, { UserDocument } from '../models/Users'
import {
  NotFoundError,
  BadRequestError,
  FailedRequestError,
  InternalServerError,
} from '../helpers/apiError'
import { googlePayloadProperties } from 'fbgraph'

async function create(user: UserDocument): Promise<UserDocument> {
  try {
    const newUser = await user.save()

    return newUser
  } catch (error) {
    throw new InternalServerError()
  }
}

async function findById(userId: string): Promise<UserDocument> {
  try {
    const user = await User.findById(userId).select('+password').exec() // .exec() will return a true Promise
    if (!user) {
      throw new Error(`User ${userId} not found`)
    }
    return user
  } catch (error) {
    throw new FailedRequestError()
  }
}

function findAll(): Promise<UserDocument[]> {
  return User.find().sort({ name: 1 }).exec() // Return a Promise
}

async function update(userId: string, update: any) {
  try {
    const user = await User.findById(userId).exec()
    if (!user) throw new Error(`User ${userId} not found`)

    if (update.username) {
      user.username = update.username
    }
    if (update.firstname) {
      user.firstname = update.firstname
    }
    if (update.lastname) {
      user.lastname = update.lastname
    }
    if (update.email) {
      const checkEmail = await User.findOne(update.email).exec()
      if (checkEmail) {
        throw new BadRequestError('Email already existsß')
      }
      user.email = update.email
    }

    const updated = await user.save()

    return updated
  } catch (error) {
    throw new NotFoundError()
  }
}

function deleteUser(userId: string): Promise<UserDocument | null> {
  return User.findByIdAndDelete(userId).exec()
}

//google find or create user after auth

async function findByEmail(email: string) {
  try {
    const user = await User.findOne({ email: email })

    return user
  } catch (error) {
    throw new NotFoundError()
  }
}

export const findOrCreateUser = async (payload: googlePayloadProperties) => {
  try {
    const response = await findByEmail(payload?.email)
    if (response) {
      return response
    } else {
      throw new NotFoundError()
    }
  } catch (error) {
    try {
      const user = new User(payload)

      return await create(user)
    } catch (error) {
      throw new BadRequestError()
    }
  }
}

export default {
  create,
  findById,
  findAll,
  update,
  deleteUser,
  findOrCreateUser,
  findByEmail,
}
