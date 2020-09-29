import express from 'express'
import { requestReset, validateReset, resetPassword } from '../controllers/auth'
import { check } from 'express-validator'

const router = express.Router()

// Every path we define here will get /api/v1/auth prefix

//password reset
router.post('/password-request', requestReset)
router.get('/password-reset/:token', validateReset)
router.post(
  '/password-reset/:token',
  [
    check('password')
      .not()
      .isEmpty()
      .isLength({ min: 6 })
      .withMessage('Must be at least 6 chars long'),
    check('confirmPassword', 'Passwords do not match').custom(
      (value, { req }) => value === req.body.password
    ),
  ],
  resetPassword
)

export default router
