import { expect, test, beforeAll, afterAll } from 'vitest'
import supertest from 'supertest'
import { app } from '../src/app'

beforeAll(async () => {
  await app.ready()
})

afterAll(async () => {
  await app.close()
})

test('user should be create new transaction', async () => {
  const response = await supertest(app.server).post('/transactions').send({
    title: 'New transaction',
    amount: 300,
    type: 'credit',
  })

  expect(response.status).toEqual(201)
})
