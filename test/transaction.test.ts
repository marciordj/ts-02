import { expect, beforeAll, afterAll, describe, it } from 'vitest'
import supertest from 'supertest'
import { app } from '../src/app'

describe('Transaction routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be create new transaction', async () => {
    const response = await supertest(app.server).post('/transactions').send({
      title: 'New transaction',
      amount: 300,
      type: 'credit',
    })

    expect(response.status).toEqual(201)
  })

  it('should be get all transactions', async () => {
    const createTransaction = await supertest(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 300,
        type: 'credit',
      })

    const cookies = createTransaction.get('Set-Cookie')
    const request = await supertest(app.server)
      .get('/transactions')
      .set('Cookie', cookies)

    expect(request.status).toBe(200)
    expect(request.body.listTransactions).toEqual([
      expect.objectContaining({
        title: 'New transaction',
        amount: 300,
      }),
    ])
  })
})
