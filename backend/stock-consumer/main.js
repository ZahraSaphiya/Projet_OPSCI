import { Kafka } from 'kafkajs'
const BROKER_1 = 'kafka:9093'
const BROKER_2 = 'kafka:9093'
const BROKER_3 = 'kafka:9093'

const TOKEN = '7826eed497824d438bba872f0303cc0f3b157dc4747cf8a8eb1b8aeb6abad0fd6e68edb13fe882b46e51b188a9ada1f1d9d650647ee94fe082c57411ea4c7ed24ac55749a2630c16c4189b90d8439a3f09815d5a9dadaab499dcf3b2de8673f2e3538b90fc7710689801bf0a4d4269150528dc96370018346a19016d6b5c0a40'
const STRAPI_URL = 'http://strapi:1337'
const TOPIC = 'stock'
const BEGINNING ='false'
const ERROR_TOPIC = 'errors'

const log = (...str) => console.log(`${new Date().toUTCString()}: `, ...str)

const kafka = new Kafka({
  clientId: 'stock-consumer',
  brokers: [BROKER_1,BROKER_2,BROKER_3],
})

const consumer = kafka.consumer({ groupId: 'stock-creator' })
const producer = kafka.producer()

const consume = async () => {
  await Promise.all([consumer.connect(), producer.connect()])
  await consumer.subscribe({ topic: TOPIC, fromBeginning: BEGINNING })

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const strProduct = message.value.toString()
        const stock = JSON.parse(strProduct)
        log('creating', strProduct)
        log(stock, await applyStockChange(stock))
        log('created', strProduct)
      } catch (error) {
        console.error(error)
        if (ERROR_TOPIC)
          producer.send({
            topic: ERROR_TOPIC,
            messages: [{ value: JSON.stringify({ error, message }) }],
          })
      }
    },
  })
}

const applyStockChange = async (stock) => {
  console.log('stock passe en parametre', stock)
  if (!stock.id || !stock.type || !stock.amount)
    throw new Error('invalid format')

  const product = await fetch(STRAPI_URL + '/api/products/' + stock.id, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'content-type': 'application/json',
    },
  })
    .then((r) => r.json())
    .then((r) => {
    console.log('Réponse brute de Strapi:', r); 
    return r.data;
  });

  const changeStock = (stock.type === 'IN' ? 1 : -1) * stock.amount

//  if (changeStock < 0) throw new Error('negative stock')

//  const data = {
//    available_stock: product.attributes.stock_available + changeStock,
//  }

  const newStock = product.attributes.stock_available + changeStock

  if (newStock < 0) throw new Error('negative stock')
  
  //on a rajouté ces lignes pour gérer le statut 
  let newStatut = product.attributes.statut
  if (newStock >10) newStatut = 'safe'
  else if (newStock > 0) newStatut = 'danger'
  else newStatut = 'empty'
  
  const data = {
    stock_available: newStock,
    statut : newStatut,
  }

  console.log(JSON.stringify({ data }))
  const res = await fetch(STRAPI_URL + '/api/products/' + stock.id, {
    method: 'PUT',
    body: JSON.stringify({
      data,
    }),
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'content-type': 'application/json',
    },
  })
  if (res.ok) {
    const response = await res.json()
    return response
  }
  return 'error'
}

await consume()
