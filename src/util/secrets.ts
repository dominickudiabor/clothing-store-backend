import dotenv from 'dotenv'
import fs from 'fs'

import logger from './logger'

if (fs.existsSync('.env')) {
  logger.debug('Using .env file to supply config environment variables')
  dotenv.config({ path: '.env' })
}
export const ENVIRONMENT = process.env.NODE_ENV
const prod = ENVIRONMENT === 'production' // Anything else is treated as 'dev'

export const CLIENT_ID = process.env['CLIENT:ID'] as string
export const ADMIN = process.env['ADMIN'] as string
export const SESSION_SECRET = process.env['SESSION_SECRET'] as string
export const USERNAME = process.env['USERNAME'] as string
export const PASSWORD = process.env['PASSWORD'] as string
export const JWT_SECRET = process.env['JWT_SECRET'] as string
export const SENDGRID_API_KEY = process.env['SENDGRID_API_KEY'] as string
export const FROM_EMAIL = process.env['FROM_EMAIL'] as string
export const STRIPE_SECRET_KEY = process.env['STRIPE_SECRET_KEY'] as string
export const PORT = process.env['PORT' as string]
export const CLOUD_NAME = process.env['CLOUD_NAME'] as string
export const CLOUD_API_KEY = process.env['CLOUD_API_KEY'] as string
export const CLOUD_API_SECRET = process.env['CLOUD_API_SECRET'] as string

export const MONGODB_URI = (prod
  ? process.env['MONGODB_URI']
  : process.env['MONGODB_URI_LOCAL']) as string

if (!SESSION_SECRET || !JWT_SECRET) {
  logger.error(
    'No client secret. Set SESSION_SECRET or JWT_SECRET environment variable.'
  )
  process.exit(1)
}

if (!MONGODB_URI) {
  if (prod) {
    logger.error(
      'No mongo connection string. Set MONGODB_URI environment variable.'
    )
  } else {
    logger.error(
      'No mongo connection string. Set MONGODB_URI_LOCAL environment variable.'
    )
  }
  process.exit(1)
}
