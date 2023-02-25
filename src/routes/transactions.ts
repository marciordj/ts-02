import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import crypto, { randomUUID } from 'node:crypto'
import { checkSessionIdExist } from '../middlewares/checkSessionIdExist'

export async function transactionRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExist],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const listTransactions = await knex('transactions')
        .select()
        .where('session_id', sessionId)

      return {
        listTransactions,
      }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExist],
    },
    async (request) => {
      const requestSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = requestSchema.parse(request.params)

      const findTransaction = await knex('transactions').where('id', id).first()

      return {
        findTransaction,
      }
    },
  )

  app.get(
    '/resume',
    {
      preHandler: [checkSessionIdExist],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const resumeTransactions = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()

      return {
        resumeTransactions,
      }
    },
  )

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
