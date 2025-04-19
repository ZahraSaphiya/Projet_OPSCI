import { Kafka } from 'kafkajs'

const BROKER_1 = 'kafka:9093'
const BROKER_2 = 'kafka:9093'
const BROKER_3 = 'kafka:9093'

const TOKEN = '7826eed497824d438bba872f0303cc0f3b157dc4747cf8a8eb1b8aeb6abad0fd6e68edb13fe882b46e51b188a9ada1f1d9d650647ee94fe082c57411ea4c7ed24ac55749a2630c16c4189b90d8439a3f09815d5a9dadaab499dcf3b2de8673f2e3538b90fc7710689801bf0a4d4269150528dc96370018346a19016d6b5c0a40'
const STRAPI_URL ='http://strapi:1337'
const TOPIC = 'event'
const BEGINNING = 'false'
const ERROR_TOPIC = 'errors'

const log = (...str) => console.log(`${new Date().toUTCString()}: `, ...str)

const kafka = new Kafka({
  clientId: 'event-consumer',
  brokers: [BROKER_1,BROKER_2,BROKER_3],
})

const consumer = kafka.consumer({ groupId: 'event-creator' })
const producer = kafka.producer()

const consume = async () => {
  await Promise.all([consumer.connect(), producer.connect()])
  await consumer.subscribe({ topic: TOPIC, fromBeginning: BEGINNING })

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const strProduct = message.value.toString()
        const event = JSON.parse(strProduct)
        log('creating', strProduct)
        log(event.name, await createEvent(event))
        log('created', strProduct)
      } catch (error) {
        if (ERROR_TOPIC)
          producer.send({
            topic: ERROR_TOPIC,
            messages: [{ value: { error, message } }],
          })
      }
    },
  })
}

const createEvent = async (event) => {
  const res = await fetch(STRAPI_URL + '/api/events', {
    method: 'POST',
    body: JSON.stringify({
      data: event,
    }),
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'content-type': 'application/json',
    },
  })
  if (res.status === 200) {
    const response = await res.json()
    return response
  }
  return 'error'
}

await consume()
