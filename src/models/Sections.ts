import mongoose, { Document } from 'mongoose'

export type SectionDocument = Document & {
  title: string;
  imageUrl: string;
  size: string;
}

const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    unique: true,
    index: true,
  },
  imageUrl: {
    type: String,
    unique: true,
  },
  size: {
    type: String,
    required: false,
  },
})

export default mongoose.model<SectionDocument>('Section', sectionSchema)
