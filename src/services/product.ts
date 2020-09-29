import Product, { ProductDocument } from '../models/Product'
import {
  NotFoundError,
  InternalServerError,
  BadRequestError,
} from '../helpers/apiError'
import Section, { SectionDocument } from '../models/Sections'
import mongoose from 'mongoose'
import { ProductItemDocument } from '../models/ProductItem'

async function findById(productId: string): Promise<ProductDocument> {
  try {
    const product = await Product.findById(productId).exec() // .exec() will return a true Promise

    if (product === null) {
      throw new Error(`Product ${productId} not found`)
    } else {
      return product
    }
  } catch (error) {
    throw new NotFoundError()
  }
}

async function findByValue(value: string): Promise<ProductDocument> {
  const product = await Product.findOne({ routeName: value }).exec() // .exec() will return a true Promise

  if (!product) {
    throw new NotFoundError()
  }
  return product
}

async function findAll(): Promise<ProductDocument[]> {
  const response = await Product.find().sort({ sizes: 1 }).exec()
  if (response.length === 0) {
    throw new NotFoundError()
  } else {
    return response
  }
}

async function findByPage(
  page: number,
  limit: number
): Promise<ProductDocument[]> {
  const response = await Product.find()
    .skip(limit * (page - 1))
    .limit(limit)
    .exec() // Return a Promise

  if (response.length !== 0) {
    return response
  } else {
    throw new NotFoundError()
  }
}

async function update(
  productId: string,
  productUpdate: Partial<ProductItemDocument>
): Promise<ProductDocument> {
  try {
    var id = mongoose.Types.ObjectId(productId)
    const product = await Product.findOne({ 'items._id': productId }).exec()
    const productDetails = product?.items.filter((item) => {
      var pid = mongoose.Types.ObjectId(item._id)
      return pid.equals(id)
    }) as any
    const oldProduct = productDetails[0]

    if (productDetails?.length === 0) {
      throw new Error(`Product ${productId} not found`)
    }
    if (productUpdate?.name) {
      oldProduct.name = productUpdate.name
    }
    if (productUpdate?.imageUrl) {
      oldProduct.imageUrl = productUpdate.imageUrl
    }
    if (productUpdate?.price) {
      oldProduct.price = productUpdate.price
    }

    const updated = await product?.save()
    if (!updated) {
      throw new BadRequestError()
    }

    return updated
  } catch (error) {
    throw new NotFoundError()
  }
}

async function deleteProduct(productId: string) {
  var id = mongoose.Types.ObjectId(productId)
  const productCategory = await Product.findOne({ 'items._id': productId })

  const categoryItems = productCategory?.items

  const productIndex = categoryItems?.findIndex((item) => {
    var pid = mongoose.Types.ObjectId(item._id)
    return pid.equals(id)
  }) as any
  categoryItems?.splice(productIndex, 1)

  const deleted = await productCategory?.save()
  if (!update) {
    throw new BadRequestError()
  }
  return deleted
}

async function createSections(data: SectionDocument[]) {
  try {
    await Section.create(data)
  } catch (error) {
    throw new InternalServerError()
  }
}

async function findAllSections(): Promise<SectionDocument[]> {
  return Section.find().exec() // Return a Promise
}

async function createInventory(data: ProductDocument[]) {
  try {
    await Product.create(data)
  } catch (error) {
    throw new InternalServerError()
  }
}

async function findInventory(): Promise<ProductDocument[]> {
  return Product.find().exec() // Return a Promise
}

export default {
  findById,
  findByValue,
  findAll,
  findByPage,
  update,
  deleteProduct,
  createSections,
  findAllSections,
  createInventory,
  findInventory,
}
