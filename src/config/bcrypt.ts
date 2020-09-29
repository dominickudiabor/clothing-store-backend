import bcrypt from 'bcryptjs'
import { FailedRequestError } from '../helpers/apiError'

export const bcryptGenerate = async (payload: string) => {
  try {
    const hash = await bcrypt.hash(payload, 8)
    return hash
  } catch (error) {
    throw new FailedRequestError()
  }
}
