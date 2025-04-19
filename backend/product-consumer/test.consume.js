import { Kafka } from 'kafkajs'
import { faker } from '@faker-js/faker'
import fs from 'fs'

const BROKER_1 = 'kafka:9093'
const BROKER_2 = 'kafka:9093'
const BROKER_3 = 'kafka:9093'

const kafka = new Kafka({
  clientId: 'product-consumer',
  brokers: [BROKER_1, BROKER_2, BROKER_3],
})

const producer = kafka.producer()

const genProduct = () => ({
  name: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  stock_available: faker.datatype.number({ min: 1, max: 40 }), // Correction de l'utilisation de FakerJS
  barcode: faker.commerce.isbn({ variant: 10, separator: '' }),
  statut: ['safe', 'danger','empty'][faker.datatype.number({ min: 0, max: 1 })], // Correction de l'utilisation de FakerJS
})

const produce = (amount = 1) => new Array(amount).fill(0).map(genProduct)

const produceProduct = async (products) => {
  await producer.connect()
  await producer.send({
    topic: 'product',
    messages: products.map((product) => ({
      value: JSON.stringify(product),
    })),
  })
  console.log(products.map((p) => p.name).join('\n'))
  await producer.disconnect()
}

await produceProduct(produce(10))
//
//
// fs.writeFileSync(
//   '../product-producer/products.json',
//   [
//     'name,description,stock_available,barcode,statut',
//     ...produce(200).map((r) =>
//       [r.name, r.description, r.stock_available, r.barcode, r.statut].join(',')
//     ),
//   ].join('\n')
// )
