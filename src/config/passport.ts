/* eslint-disable @typescript-eslint/camelcase */
import GoogleTokenStrategy from 'passport-google-id-token'
import UserService from '../services/user'

import { CLIENT_ID, ADMIN } from '../util/secrets'
import { tokenProperties } from 'fbgraph'

export default () =>
  new GoogleTokenStrategy(
    {
      clientID: CLIENT_ID,
    },
    async function (
      parsedToken: tokenProperties,
      googleId: string,
      done: Function
    ) {
      const {
        given_name,
        email,
        family_name,
        picture,
        email_verified,
      } = parsedToken.payload
      if (email && email_verified) {
        const googlePayload = {
          username: given_name,
          email: email,
          firstname: given_name,
          lastname: family_name,
          photo: picture,
          password: null,
          role: email === ADMIN ? 'admin' : 'user',
          googleId: googleId,
        }

        try {
          const user = await UserService.findOrCreateUser(googlePayload)
          done(null, user)
        } catch (error) {
          done(error, false)
        }
      } else {
        done(null, false)
      }
    }
  )
