import mongoose, { Document } from 'mongoose'

export type ProductItemDocument = Document & {
  name: string
  imageUrl: string
  price: number
}

export const ProductItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
    },
    imageUrl: {
      type: String,
      unique: true,
    },
    price: {
      type: Number,
    },
  },
  { timestamps: true }
)
