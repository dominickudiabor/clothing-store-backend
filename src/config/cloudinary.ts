import { CLOUD_API_KEY, CLOUD_API_SECRET, CLOUD_NAME } from '../util/secrets'

const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_API_SECRET,
})

export default cloudinary
