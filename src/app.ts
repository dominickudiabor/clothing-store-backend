import express from 'express'
import compression from 'compression'
import bodyParser from 'body-parser'
import lusca from 'lusca'
import mongoose from 'mongoose'
import bluebird from 'bluebird'
import cors from 'cors'

import { MONGODB_URI, PORT } from './util/secrets'

import movieRouter from './routers/movie'
import userRouter from './routers/user'
import productRouter from './routers/product'
import adminRouter from './routers/admin'
import authRouter from './routers/auth'

import apiErrorHandler from './middlewares/apiErrorHandler'
import apiContentType from './middlewares/apiContentType'

import passport from 'passport'
import GoogleTokenStrategy from './config/passport'
import unless from './util/auth'
import authJwt from './middlewares/authJwt'

const app = express()
const mongoUrl = MONGODB_URI

mongoose.Promise = bluebird
mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
  })
  .catch((err: Error) => {
    console.log(
      'MongoDB connection error. Please make sure MongoDB is running. ' + err
    )
    process.exit(1)
  })

// Express configuration
app.set('port', PORT || 9000)

const excludedPaths = [
  /v1\/users\/signup/,
  /v1\/users\/login/,
  /v1\/users\/verify-email/,
  /v1\/users\/google-authenticate/,
  /v1\/auth/,
  /v1\/admin\/fetchSections/,
  /v1\/admin\/fetchInventory/,
]

// Use common 3rd-party middlewares
app.use(
  cors({
    origin: '*', // specify client server baseurl
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
)
app.use(compression())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(lusca.xframe('SAMEORIGIN'))
app.use(lusca.xssProtection(true))
app.use(passport.initialize())
app.use('/api', apiContentType, unless(excludedPaths, authJwt))

//passport
passport.use(GoogleTokenStrategy())

// Use movie router
app.use('/api/v1/movies', movieRouter)

// Use user router
app.use('/api/v1/users', userRouter)

//Use product router
app.use('/api/v1/products', productRouter)

//Use admin router
app.use('/api/v1/admin', adminRouter)

//Use auth router
app.use('/api/v1/auth', authRouter)

// Custom API error handler
app.use(apiErrorHandler)

export default app
