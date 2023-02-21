import fastify from 'fastify'
import { knex } from './database'
import crypto from 'node:crypto'
import { env } from './env'

const app = fastify()

app.get('/hello', async () => {
  // const transaction = await knex('transactions')
  //   .insert({
  //     id: crypto.randomUUID(),
  //     title: 'Transacão teste',
  //     amount: 1200,
  //   })
  //   .returning('*')

  const select = await knex('transactions').select('*')

  return select
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => console.log('Server started'))
