import Product from '../../src/models/Product'
import ProductService from '../../src/services/product'
import * as dbHelper from '../db-helper'

const nonExistingProductId = '8ef5ad63b53b57dd876d6908'

async function createProduct() {
  const product = new Product({
    name: 'Nike Zoom vomero 13',
    description: 'Lightweight running shoes',
    categories: ['running', 'trail'],
    variants: ['black', 'white', 'blue'],
    sizes: [7, 8, 9, 10, 11],
  })
  return await ProductService.create(product)
}

describe('product service', () => {
  beforeEach(async () => {
    await dbHelper.connect()
  })

  afterEach(async () => {
    await dbHelper.clearDatabase()
  })

  afterAll(async () => {
    await dbHelper.closeDatabase()
  })

  it('should create a new product', async () => {
    const product = await createProduct()
    expect(product).toHaveProperty('_id')
    expect(product).toHaveProperty('description')
    expect(product).toHaveProperty('sizes')
    expect(product).toHaveProperty('categories')
    expect(product).toHaveProperty('variants')
  })

  it('should get a product with value', async () => {
    const product = await createProduct()
    const found = await ProductService.findByValue(
      'name',
      'Nike Zoom vomero 13'
    )
    expect(found[0].name).toEqual(product.name)
    expect(found[0]._id).toEqual(product._id)
  })

  it('should not create product if it exists', async () => {
    expect.assertions(1)
    await createProduct()
    const newProduct = new Product({
      name: 'Nike Zoom vomero 13',
      description: 'Lightweight running shoes',
      categories: ['running', 'trail'],
      variants: ['black', 'white', 'blue'],
      sizes: [7, 8, 9, 10, 11],
    })

    return ProductService.create(newProduct).catch((e) =>
      expect(e.message).toMatch('ValidationError')
    )
  })

  it('return error if search by value fails', async () => {
    expect.assertions(1)
    return ProductService.findByValue('hero', 'nero').catch((e) =>
      expect(e.message).toMatch('Not Found')
    )
  })

  it('should get a product with id', async () => {
    const product = await createProduct()
    const found = await ProductService.findById(product._id)
    expect(found.name).toEqual(product.name)
    expect(found._id).toEqual(product._id)
  })

  it('should get all products', async () => {
    await createProduct()
    const found = await ProductService.findAll()
    expect(found.length).toBeGreaterThan(0)
  })

  it('should get a product with pagination', async () => {
    await createProduct()
    const found = await ProductService.findByPage(1, 1)
    expect(found.length).toBeGreaterThan(0)
  })

  it('return error if search by pagination fails', async () => {
    expect.assertions(1)
    return ProductService.findByPage(-1, -1).catch((e) =>
      expect(e.message).toMatch('Not Found')
    )
  })

  it('should delete an existing product', async () => {
    const product = await createProduct()
    const response = await ProductService.deleteProduct(product._id)
    expect(response).toHaveProperty('_id')
  })

  it('should not delete a product with wrong  id', async () => {
    expect.assertions(2)
    const product = await createProduct()
    try {
      await ProductService.deleteProduct(nonExistingProductId)
    } catch (error) {
      const stillExist = await ProductService.findById(product._id)
      expect(error.message).toBe('Not Found')
      expect(stillExist.name).toBe(product.name)
    }
  })

  it('should update an existing product', async () => {
    const product = await createProduct()
    const update = {
      name: 'Nike Zoom vomero 17',
      description: 'Heavyweight running sneakers',
      categories: ['running', 'trail', 'gym'],
      variants: ['black', 'white', 'blue', 'teal'],
      sizes: [7, 8, 9, 10, 11, 14],
    }
    const updated = await ProductService.update(product._id, update)
   
    expect(updated).toHaveProperty('_id', product._id)
    expect(updated.name).toEqual('Nike Zoom vomero 17')
    expect(updated.description).toEqual('Heavyweight running sneakers')
    expect(updated.categories).toEqual(expect.arrayContaining(['gym']))
    expect(updated.variants).toEqual(expect.arrayContaining(['teal']))
    expect(updated.sizes).toEqual(expect.arrayContaining([14]))
 
  })

  it('should not update a non-existing product', async () => {
    const update = {
      variants: ['black', 'white', 'blue', 'teal'],
      sizes: [7, 8, 9, 10, 11, 14],
    }
    expect.assertions(1)
    return ProductService.update(nonExistingProductId, update).catch((e) => {
      expect(e.message).toBe('Not Found')
    })
  })
})
