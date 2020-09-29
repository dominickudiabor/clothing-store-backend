import User from '../../src/models/Users'
import UserService from '../../src/services/user'
import * as dbHelper from '../db-helper'

const nonExistingUserId = '8ef5ad63b53b57dd876d6908'

async function createUser() {
  const user = new User({
    username: 'TravisKudix',
    firstname: 'Travis',
    lastname: 'Kudix',
    email: 'traviskudix@gmail.com',
    password: 'Asd1',
  })
  return await UserService.create(user)
}

describe('user service', () => {
  beforeEach(async () => {
    await dbHelper.connect()
  })

  afterEach(async () => {
    await dbHelper.clearDatabase()
  })

  afterAll(async () => {
    await dbHelper.closeDatabase()
  })

  it('should create a new user', async () => {
    expect.assertions(7)
    const user = await createUser()

    expect(user).toHaveProperty('_id')
    expect(user).toHaveProperty('username')
    expect(user).toHaveProperty('firstname')
    expect(user).toHaveProperty('lastname')
    expect(user).toHaveProperty('password')
    expect(user).toHaveProperty('email')

    const wrongUser = new User({
      username: 'TravisKudix',
    })
    return UserService.create(wrongUser).catch((e) =>
      expect(e.message).toMatch(
        'User validation failed: email: Path `email` is required.'
      )
    )
  })

  it('should get a user with id', async () => {
    expect.assertions(3)
    const user = await createUser()
    const found = await UserService.findById(user._id)
    expect(found.username).toEqual(user.username)
    expect(found._id).toEqual(user._id)

    return await UserService.findById(nonExistingUserId).catch((e) =>
      expect(e.message).toMatch('ValidationError')
    )
  })

  it('should update user credentials', async () => {
    expect.assertions(6)
    const user = await createUser()
    const update = {
      username: 'TravisWolf',
      firstname: 'Wolf',
      lastname: 'Hart',
      email: 'wolfhart@gmail.com',
    }
    const updated = await UserService.update(user._id, update)
    expect(updated).toHaveProperty('_id', user._id)
    expect(updated.username).toEqual('TravisWolf')
    expect(updated.firstname).toEqual('Wolf')
    expect(updated.lastname).toEqual('Hart')
    expect(updated.email).toEqual('wolfhart@gmail.com')

    return UserService.update(nonExistingUserId, update).catch((e) =>
      expect(e.message).toMatch(`User ${nonExistingUserId} not found`)
    )
  })

  it('should find user by email', async () => {

    const user = await createUser()
    const foundUser = await UserService.findByEmail(user.email)
    expect(foundUser?._id).toEqual(user._id)


  })

  it('should find or create google user', async () => {
   const userInfo = {
    username: 'TravisWolf',
    firstname: 'Wolf',
    lastname: 'Hart',
    email: 'wolfhart@gmail.com',
    googleId: nonExistingUserId
   }
    const user = await UserService.findOrCreateUser(userInfo)
  expect(user.email).toMatch(userInfo.email)
  })
})
