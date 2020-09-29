import cloudinary from '../config/cloudinary'

let streamifier = require('streamifier')

export const streamUpload = (req: any) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      (error: any, result: any) => {
        if (result) {
          resolve(result)
        } else {
          reject(error)
        }
      }
    )

    streamifier.createReadStream(req.file.buffer).pipe(stream)
  })
}
