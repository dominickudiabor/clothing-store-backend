import express from 'express'

import passport from 'passport'

import {
  createUser,
  updateUser,
  updatePassword,
  authenticateUser,
  findExistingUser,
  confirmEmail,
  verifyEmail,
  processPayment,
  uploadPhoto,
} from '../controllers/user'

const multer = require('multer')
const upload = multer().single('photo')

const router = express.Router()

// Every path we define here will get /api/v1/users prefix

router.post('/signup', createUser)
router.post('/login', findExistingUser)
router.put('/:userId', updateUser)
router.post('/update-password/:userId', updatePassword)
router.post('/confirm-email/:userId', confirmEmail)
router.get('/verify-email/:token', verifyEmail)
router.post(
  '/google-authenticate',
  passport.authenticate('google-id-token', { session: false }),
  authenticateUser
)
router.post('/stripe-payment/:userId', processPayment)
router.post('/upload-photo/:userId', upload, uploadPhoto)

export default router
