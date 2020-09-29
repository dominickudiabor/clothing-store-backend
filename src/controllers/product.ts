import { Request, Response, NextFunction } from 'express'
import UserService from '../services/user'
import Product, { ProductDocument } from '../models/Product'
import ProductService from '../services/product'
import {
  NotFoundError,
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
} from '../helpers/apiError'
import { ProductItemDocument } from '../models/ProductItem'

// POST  /createproduct/adminId create a new product

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { product } = req.body
    const { name, imageUrl, price, category } = product
    const newProduct = { name, imageUrl, price } as ProductItemDocument
    const sneakers = await ProductService.findByValue(category)
    sneakers.items.push(newProduct)
    await sneakers.save()
    res.json(await ProductService.findAll())
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(new BadRequestError('Invalid Request', error))
    } else {
      next(new InternalServerError('Internal Server Error', error))
    }
  }
}

// PUT update products by ID
//PUT '/:productId'
//admin*******
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { product: productUpdate } = req.body
    const productId = req.params.productId
    const updatedProduct = await ProductService.update(productId, productUpdate)

    if (updatedProduct) {
      return res.status(200).json(await ProductService.findAll())
    }
  } catch (error) {
    next(new NotFoundError('Product not found', error))
  }
}

// DELETE products by ID
// DELETE /:productId
//admin*******
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleteRequest = await ProductService.deleteProduct(
      req.params.productId
    )
    if (deleteRequest) {
      return res.status(200).json(await ProductService.findAll())
    }
  } catch (error) {
    next(new NotFoundError('Product not found', error))
  }
}

// GET  all products
//GET /
export const findAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(await ProductService.findAll())
  } catch (error) {
    next(new NotFoundError('Products not found', error))
  }
}

//POST /batch-insert/:adminId
export const insertSections = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await UserService.findById(req.params.adminId)
    if (!user) {
      throw new NotFoundError()
    }
    const data = req.body.sections

    await ProductService.createSections(data)
    res.status(200).json({ message: 'Sections Created' })
  } catch (error) {
    next(new UnauthorizedError('Unauthorized access', error))
  }
}

//GET /fetchSections
export const fetchSections = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = await ProductService.findAllSections()
    if (response.length === 0) {
      throw new NotFoundError()
    }
    res.status(200).json(response)
  } catch (error) {
    next(new NotFoundError('Sections not found'))
  }
}

//POST /inventory/:adminId
export const insertInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await UserService.findById(req.params.adminId)
    if (!user) {
      throw new NotFoundError()
    }
    const data = req.body.inventory

    await ProductService.createInventory(data)
    res.status(200).json({ message: 'Inventory Created' })
  } catch (error) {
    next(new UnauthorizedError('Unauthorized access', error))
  }
}

//GET /fetchInventory
export const fetchInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = await ProductService.findInventory()
    if (response.length === 0) {
      throw new NotFoundError()
    }

    res.status(200).json(response)
  } catch (error) {
    next(new NotFoundError('Inventory not found'))
  }
}

// GET products with pagination
//GET /PAGE/:number/:limit
export const findByPage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pageNumber = parseInt(req.params.number)
  const pageLimit = parseInt(req.params.limit)

  try {
    const reg = new RegExp(/^\d+$/)
    if (reg.test(req.params.number)) {
      res.json(await ProductService.findByPage(pageNumber, pageLimit))
    } else {
      throw new Error()
    }
  } catch (error) {
    next(new NotFoundError('Products not found', error))
  }
}

// GET products by ID
//GET /:productId
export const findById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(await ProductService.findById(req.params.productId))
  } catch (error) {
    next(new NotFoundError('Product not found', error))
  }
}

// GET products by key and value
//GET /search/:objectKey?filter=value
export const findByValue = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const key = req.params.objectKey
  const value = req.query.filter as string
  try {
    switch (key) {
      case 'name':
      case 'description':
      case 'variants':
      case 'sizes':
      case 'categories':
        res.json(await ProductService.findByValue(value))
        break
      default:
        throw new Error()
    }
  } catch (error) {
    next(new NotFoundError('Product not found', error))
  }
}
