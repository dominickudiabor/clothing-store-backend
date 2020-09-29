import mongoose, { Document } from 'mongoose'
import { ProductItemDocument, ProductItemSchema } from './ProductItem'

export type ProductDocument = Document & {
  title: string;
  routeName: string;
  items: ProductItemDocument[];
}

const productSchema = new mongoose.Schema(
  {
    title: { type: String, unique: true, required: true },
    routeName: { type: String, required: true, unique: true },
    items: [ProductItemSchema],
  },
  { timestamps: true }
)

export default mongoose.model<ProductDocument>('Product', productSchema)
