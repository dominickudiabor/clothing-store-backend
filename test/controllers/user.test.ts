import request from 'supertest'
import { UserDocument } from '../../src/models/Users'
import app from '../../src/app'
import * as dbHelper from '../db-helper'


const nonExistingUserId = '3927947f99v9v97v48785'

async function createUser(override?: Partial<UserDocument>) {
  let user = {
    username: 'TravisKudix',
    firstname: 'Travis',
    lastname: 'Kudix',
    email: 'traviskudix@gmail.com',
    password: 'Asd1',
  }
  if (override) {
    user = { ...user, ...override }
  }

  return await request(app).post('/api/v1/users').send(user)
}

describe('user controller', () => {
  beforeEach(async () => {
    await dbHelper.connect()
  })

  afterEach(async () => {
    await dbHelper.clearDatabase()
  })

  afterAll(async () => {
    await dbHelper.closeDatabase()
  })

  it('should create a user', async () => {
    const res = await createUser()
    expect(res.body).toHaveProperty('_id')
    expect(res.body.firstname).toBe('Travis')
    expect(res.body.email).toEqual('traviskudix@gmail.com')
  })

  it('should not create a new user with wrong data', async () => {
    const res = await request(app).post('/api/v1/users').send({
      username: 'TravisKudix',
      firstname: 112,
      lastname: 991,
    })

    expect(res.status).toBe(400)
  })

  it('should not create a new user with the same email', async () => {
    const res = await createUser()

    const res1 = await request(app).post('/api/v1/users').send({
      username: 'TravisKudix',
      firstname: 'Travis',
      lastname: 'Kudix',
      email: res.body.email,
      password: 'Asd1',
    })

    expect(res1.text).toEqual(expect.stringContaining('User already exists'))
  })

  it('should update a user', async () => {
    const res = await createUser()

    const update = {
      username: 'TravisWolf',
      lastname: 'Wolf',
    }
    const userId = res.body._id
    const res1 = await request(app).put(`/api/v1/users/${userId}`).send(update)

    expect(res1.status).toBe(200)
    expect(res1.body.username).toBe('TravisWolf')
    expect(res1.body.lastname).toBe('Wolf')
  })

  it('should not  update a user with wrong id', async () => {
    await createUser()

    const update = {
      username: 'TravisWolf',
      lastname: 'Wolf',
    }

    const res1 = await request(app)
      .put(`/api/v1/users/${nonExistingUserId}`)
      .send(update)

    expect(res1.status).toBe(404)
  })

  it('delete an existing user', async () => {
    const res0 = await request(app).delete(`/api/v1/users/${nonExistingUserId}`)

    expect(res0.status).toBe(404)

    const res = await createUser()

    const userId = res.body._id
    const res1 = await request(app).delete(`/api/v1/users/${userId}`)

    expect(res1.status).toBe(204)

    const res2 = await request(app).get(`/api/v1/users/${userId}`)

    expect(res2.status).toBe(404)
  })

  it('should get back all users', async () => {
    const res0 = await request(app).get('/api/v1/users')

    expect(res0.status).toBe(404)

    const res = await createUser({
      username: 'TravisKudix',
      firstname: 'Travis',
      lastname: 'Kudix',
      email: 'traviskudix@gmail.com',
      password: 'Asd1',
    })

    const res1 = await createUser({
      username: 'FrankKudix',
      firstname: 'Frank',
      lastname: 'Kudix',
      email: 'frankkudix@gmail.com',
      password: 'Asd1',
    })

    const res2 = await request(app).get('/api/v1/users')

    expect(res2.status).toBe(200)
    expect(res2.body.length).toEqual(2)
    expect(res2.body[0]._id).toEqual(res.body._id)
    expect(res2.body[1]._id).toEqual(res1.body._id)
  })

 /*  it('authenticate google user and genrate token', async () => {
    const res = await request(app)
      .post('/api/v1/users/google-authenticate')
      .send({
        'id_token':
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      })
     
    expect(res.status).toBe(200)
  }) */
  it('authenticate existing user ', async () => {
    const res0 = await request(app)
    .post('/api/v1/users/login')
    .send({
        email: 'traviskudix@gmail.com',
        password: 'Asd1',
    })
    expect(res0.status).toBe(404)
    
    await createUser()

    const res = await request(app)
    .post('/api/v1/users/login')
    .send({
        email: 'traviskudix@gmail.com',
        password: 'Asd1',
    })

    expect(res.status).toBe(200)
  })
})
