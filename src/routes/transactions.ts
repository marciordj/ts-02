import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import crypto from 'node:crypto'

export async function transactionRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const listTransactions = await knex('transactions').select()

    return {
      listTransactions,
    }
  })

  app.get('/:id', async (request) => {
    const requestSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = requestSchema.parse(request.params)

    const findTransaction = await knex('transactions').where('id', id).first()

    return {
      findTransaction,
    }
  })

  app.get('/resume', async () => {
    const resumeTransactions = await knex('transactions')
      .sum('amount', { as: 'amount' })
      .first()

    return {
      resumeTransactions,
    }
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
