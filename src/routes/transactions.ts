import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import crypto from 'node:crypto'

export async function transactionRoutes(app: FastifyInstance) {
  app.get('/list-transactions', async () => {
    const listTransactions = await knex('transactions').select('*')

    return listTransactions
  })

  app.post('/', async (request, response) => {
    const createTrasactionsSchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const body = createTrasactionsSchema.parse(request.body)

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title: body.title,
      amount: body.type === 'credit' ? body.amount : body.amount * -1,
    })

    return response.status(201).send()
  })
}
