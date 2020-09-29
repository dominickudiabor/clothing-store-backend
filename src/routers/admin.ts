import express from 'express'
import { deleteUser, banUser, verifyAdmin, findAll } from '../controllers/user'
import {
  insertSections,
  fetchSections,
  insertInventory,
  fetchInventory,
  createProduct,
  deleteProduct,
  updateProduct,
} from '../controllers/product'

const router = express.Router()

// Every path we define here will get /api/v1/admin prefix
router.get('/', findAll)
router.delete('/eradicate/:userId', deleteUser)
router.put('/ban-user/:userId', banUser)
router.post('/verification/:adminId', verifyAdmin)
router.post('/batch-insert/:adminId', insertSections)
router.post('/inventory/:adminId', insertInventory)
router.get('/fetchSections', fetchSections)
router.get('/fetchInventory', fetchInventory)
router.get('/fetchProducts', fetchInventory)
router.post('/createProduct/:adminId', createProduct)
router.delete('/eliminateProduct/:productId', deleteProduct)
router.put('/modify-product/:productId', updateProduct)
export default router
