import request from 'supertest'

import { ProductDocument } from '../../src/models/Product'
import app from '../../src/app'
import * as dbHelper from '../db-helper'

import { NextFunction } from 'express'

jest.mock('../../src/middlewares/authJwt',
    () => (req: Request, res: Response, next: NextFunction) => next()
  )


const nonExistingProductId = '3927947f99v9v97v48785'

async function createProduct(override?: Partial<ProductDocument>) {
  let product = {
    name: 'Nike Zoom vomero 13',
    description: 'Lightweight running shoes',
    categories: ['running', 'trail'],
    variants: ['black', 'white', 'blue'],
    sizes: [7, 8, 9, 10, 11],
  }
  if (override) {
    product = { ...product, ...override }
  }

  return await request(app).post('/api/v1/products').send(product)
}

describe('product controller', () => {
  beforeEach(async () => {
    await dbHelper.connect()
  })

  afterEach(async () => {
    await dbHelper.clearDatabase()
  })

  afterAll(async () => {
    await dbHelper.closeDatabase()
  })

  it('should create a product', async () => {

    const res = await createProduct()
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('_id')
    expect(res.body.name).toBe('Nike Zoom vomero 13')
    expect(res.body.sizes).toStrictEqual([7, 8, 9, 10, 11])
  })

  it('should not create a product with wrong data ', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .send({
        name: 'Nike Zoom Vomero 13',
        description: 'Lightweight running shoes',
        sizes: [7, 8, 9, 10, 11],
      })

    expect(res.status).toBe(400)
  
  })

  it('should get back an existing product', async () => {
    const res1 = await createProduct()
    expect(res1.status).toBe(200)

    const productId = res1.body._id
    const productName = res1.body.name

    const res2 = await request(app).get(`/api/v1/products/${productId}`)

    expect(res2.status).toBe(200)
    expect(res2.body._id).toBe(productId)
    expect(res2.body.name).toBe(productName)
  })

  it('it should not return non existent product', async () => {
    const res = await request(app).get(
      `/api/v1/products/${nonExistingProductId}`
    )

    expect(res.status).toBe(404)
  })

  it('it should get back all product', async () => {
    const res1 = await createProduct({
      name: 'Nike Zoom vomero 13',
      description: 'Lightweight running shoes',
    })
    expect(res1.status).toBe(200)

    const res2 = await createProduct({
      name: 'Nike Zoom DesertEagle 11',
      description: 'Lightweight running shoes',
    })
    expect(res2.status).toBe(200)

    const res3 = await createProduct({
      name: 'Nike Zoom StormBrain 4',
      description: 'Lightweight running shoes',
    })
    expect(res3.status).toBe(200)

    const res4 = await request(app).get('/api/v1/products')

    expect(res4.status).toBe(200)
    expect(res4.body.length).toEqual(3)
    expect(res4.body[0]._id).toEqual(res1.body._id)
    expect(res4.body[1]._id).toEqual(res2.body._id)
    expect(res4.body[2]._id).toEqual(res3.body._id)
  })

  it('should return error if no product exist on database',async () => {
    const res = await request(app).get('/api/v1/products')

    expect(res.status).toBe(404)
  })

  it('should update an existing product', async () => {
    const res1 = await createProduct()
    expect(res1.status).toBe(200)

    const productId = res1.body._id

    const update = {
      name: 'Nike Zoom vomero 19',
      description: 'Lightweight running sneakers',
    }

    const res2 = await request(app)
      .put(`/api/v1/products/${productId}`)
      .send(update)

    expect(res2.status).toBe(200)
    expect(res2.body.name).toBe('Nike Zoom vomero 19')
    expect(res2.body.description).toBe('Lightweight running sneakers')
  })

  it('failed to update an existing product', async () => {
    const res1 = await createProduct()
    expect(res1.status).toBe(200)

 

    const update = {
      name: 'Nike Scrill Flynit',
      description: 'Lightweight running sneakers',
    }

    const res2 = await request(app)
      .put(`/api/v1/products/${nonExistingProductId}`)
      .send(update)

    expect(res2.status).toBe(404)

  })

  it('delete an existing product', async () => {
    const res = await createProduct()
    expect(res.status).toBe(200)

    const productId = res.body._id
    const res1 = await request(app).delete(`/api/v1/products/${productId}`)

    expect(res1.status).toBe(204)

    const res3 = await request(app).get(`/api/v1/products/${productId}`)

    expect(res3.status).toBe(404)
  })

  it('failed to delete an existing product', async () => {
    const res = await createProduct()
    expect(res.status).toBe(200)

  
    const res1 = await request(app).delete(`/api/v1/products/${nonExistingProductId}`)

    expect(res1.status).toBe(404)

   

  })

  it('get back product by key and value', async () => {
      const res = await createProduct()
      expect(res.status).toBe(200)
      const productName = res.body.name

      const res1 = await  request(app)
      .get('/api/v1/products/search/name?filter=Nike%20Zoom%20vomero%2013')
      
      expect(res1.body[0].name).toBe(productName)
  })

  it('failed to get back product by key and value', async () => {
    const res = await createProduct()
    expect(res.status).toBe(200)
  

    const res1 = await  request(app)
    .get('/api/v1/products/search/seven?filter=heronero')
    
    expect(res1.status).toBe(404)
})

it('failed to get back product entering random string', async () => {
  const res = await createProduct()
  expect(res.status).toBe(200)


  const res1 = await  request(app)
  .get('/api/v1/products/search/ghdsgchgvchgvchgdvhd')
  
  expect(res1.status).toBe(404)
})

  it('get back product with pagination', async () => {
    const res = await createProduct()
    expect(res.status).toBe(200)
    const productName = res.body.name

    const res1 = await  request(app)
    .get('/api/v1/products/page/1/1')
    
    expect(res1.body[0].name).toBe(productName)
})

it('get back error with pagination', async () => {
  const res = await createProduct()
  expect(res.status).toBe(200)


  const res1 = await  request(app)
  .get('/api/v1/products/page/w/w')
  
  expect(res1.status).toBe(404)
})
})
