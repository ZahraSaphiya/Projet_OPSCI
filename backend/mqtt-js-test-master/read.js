import mqtt from 'mqtt'

const TOPIC = process.env.TOPIC || 'topic'
const ADDRESS = process.env.ADDRESS || 'ws://localhost:1883'

const client = mqtt.connect(ADDRESS)

console.log('reading...')

client.subscribe(TOPIC, (err) => {
  if (!err) {
    client.publish(TOPIC, 'Hello mqtt')
  } else console.error(err)
})

client.on('message', (topic, message) => {
  console.log('topic: ', topic)
  console.log(message.toString())
})
