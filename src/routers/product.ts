import express from 'express'

import {
  createProduct,
  findById,
  deleteProduct,
  findAll,
  findByPage,
  updateProduct,
  findByValue,
} from '../controllers/product'
import authJwt from '../middlewares/authJwt'

const router = express.Router()

// Every path we define here will get /api/v1/products prefix
router.get('/', authJwt, findAll)
router.get('/page/:number/:limit', findByPage)
router.get('/:productId', findById)
router.get('/search/:objectKey', findByValue)
router.put('/:productId', updateProduct)
router.delete('/:productId', deleteProduct)
router.post('/', createProduct)

export default router
