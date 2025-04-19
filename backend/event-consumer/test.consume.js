import { Kafka } from 'kafkajs'
import { faker } from '@faker-js/faker'

const BROKER_1 = 'kafka:9093'
const BROKER_2 = 'kafka:9093'
const BROKER_3 = 'kafka:9093'

const kafka = new Kafka({
  clientId: 'product-consumer',
  brokers: [BROKER_1, BROKER_2, BROKER_3],
})

const producer = kafka.producer()

const genProduct = () => ({
  value: faker.hacker.phrase(),
  metadata: {
    [faker.hacker.noun()]: faker.hacker.abbreviation(),
  },
})

const produce = (amount = 1) => new Array(amount).fill(0).map(genProduct)

const produceProduct = async (products) => {
  await producer.connect()
  await producer.send({
    topic: 'event',
    messages: products.map((product) => ({
      value: JSON.stringify(product),
    })),
  })
  console.log(products.map((p) => p.value).join('\n'))
  await producer.disconnect()
}

await produceProduct(produce(10))
