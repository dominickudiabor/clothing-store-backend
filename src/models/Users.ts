import mongoose, { Document } from 'mongoose'
import crypto from 'crypto'

export type UserDocument = Document & {
  username: string
  firstname: string
  lastname: string
  email: string
  password: string
  googleId: string
  photo?: string
  resetPasswordExpires?: number
  resetPasswordToken?: string
  role?: string
  isBanned: boolean
  generatePasswordReset: Function
  emailConfirmed: boolean
}

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      index: true,
      unique: true,
      required: true,
      lowercase: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      index: true,
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false,
      max: 100,
      select: false,
    },
    googleId: {
      type: String,
      required: false,
    },
    photo: {
      type: String,
      required: false,
      default: 'https://i.ibb.co/GP2pC1g/rsz-avatar.png',
    },
    resetPasswordToken: {
      type: String,
      required: false,
    },

    resetPasswordExpires: {
      type: Number,
      required: false,
    },
    role: {
      trim: true,
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    emailConfirmed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

UserSchema.methods.generatePasswordReset = function () {
  this.resetPasswordToken = crypto.randomBytes(20).toString('hex')
  this.resetPasswordExpires = Date.now() + 3600000
}

mongoose.set('useFindAndModify', false)
export default mongoose.model<UserDocument>('User', UserSchema)
