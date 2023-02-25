import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import crypto, { randomUUID } from 'node:crypto'

export async function transactionRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const sessionId = request.cookies.sessionId

    if (!sessionId) {
      return reply.status(401).send({
        error: 'Não autorizado',
      })
    }

    const listTransactions = await knex('transactions')
      .select()
      .where('session_id', sessionId)

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

  app.post('/', async (request, reply) => {
    // Fastify use reply instead response
    const createTrasactionsSchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTrasactionsSchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
      })
    }

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
